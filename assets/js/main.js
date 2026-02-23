/*
	Massively by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$nav = $('#nav'),
		$main = $('#main'),
		$navPanelToggle, $navPanel, $navPanelInner;

	// Breakpoints.
		breakpoints({
			default:   ['1681px',   null       ],
			xlarge:    ['1281px',   '1680px'   ],
			large:     ['981px',    '1280px'   ],
			medium:    ['737px',    '980px'    ],
			small:     ['481px',    '736px'    ],
			xsmall:    ['361px',    '480px'    ],
			xxsmall:   [null,       '360px'    ]
		});

	/**
	 * Applies parallax scrolling to an element's background image.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = function(intensity) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0 || intensity === 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._parallax(intensity);

			return $this;

		}

		if (!intensity)
			intensity = 0.25;

		$this.each(function() {

			var $t = $(this),
				$bg = $('<div class="bg"></div>').appendTo($t),
				on, off;

			on = function() {

				$bg
					.removeClass('fixed')
					.css('transform', 'matrix(1,0,0,1,0,0)');

				$window
					.on('scroll._parallax', function() {

						var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);

						$bg.css('transform', 'matrix(1,0,0,1,0,' + (pos * intensity) + ')');

					});

			};

			off = function() {

				$bg
					.addClass('fixed')
					.css('transform', 'none');

				$window
					.off('scroll._parallax');

			};

			// Disable parallax on ..
				if (browser.name == 'ie'			// IE
				||	browser.name == 'edge'			// Edge
				||	window.devicePixelRatio > 1		// Retina/HiDPI (= poor performance)
				||	browser.mobile)					// Mobile devices
					off();

			// Enable everywhere else.
				else {

					breakpoints.on('>large', on);
					breakpoints.on('<=large', off);

				}

		});

		$window
			.off('load._parallax resize._parallax')
			.on('load._parallax resize._parallax', function() {
				$window.trigger('scroll');
			});

		return $(this);

	};

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Scrolly.
		$('.scrolly').scrolly();

	// Background.
		$wrapper._parallax(0.925);

	// Nav Panel.

		// Toggle.
			$navPanelToggle = $(
				'<a href="#navPanel" id="navPanelToggle">Menu</a>'
			)
				.appendTo($wrapper);

			// Change toggle styling once we've scrolled past the header.
				$header.scrollex({
					bottom: '5vh',
					enter: function() {
						$navPanelToggle.removeClass('alt');
					},
					leave: function() {
						$navPanelToggle.addClass('alt');
					}
				});

		// Panel.
			$navPanel = $(
				'<div id="navPanel">' +
					'<nav>' +
					'</nav>' +
					'<a href="#navPanel" class="close"></a>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'right',
					target: $body,
					visibleClass: 'is-navPanel-visible'
				});

			// Get inner.
				$navPanelInner = $navPanel.children('nav');

			// Move nav content on breakpoint change.
				var $navContent = $nav.children();

				breakpoints.on('>medium', function() {

					// NavPanel -> Nav.
						$navContent.appendTo($nav);

					// Flip icon classes.
						$nav.find('.icons, .icon')
							.removeClass('alt');

				});

				breakpoints.on('<=medium', function() {

					// Nav -> NavPanel.
						$navContent.appendTo($navPanelInner);

					// Flip icon classes.
						$navPanelInner.find('.icons, .icon')
							.addClass('alt');

				});

			// Hack: Disable transitions on WP.
				if (browser.os == 'wp'
				&&	browser.osVersion < 10)
					$navPanel
						.css('transition', 'none');

	// Intro.
		var $intro = $('#intro');

		if ($intro.length > 0) {

			// Hack: Fix flex min-height on IE.
				if (browser.name == 'ie') {
					$window.on('resize.ie-intro-fix', function() {

						var h = $intro.height();

						if (h > $window.height())
							$intro.css('height', 'auto');
						else
							$intro.css('height', h);

					}).trigger('resize.ie-intro-fix');
				}

			// Hide intro on scroll (> small).
				breakpoints.on('>small', function() {

					$main.unscrollex();

					$main.scrollex({
						mode: 'bottom',
						top: '25vh',
						bottom: '-50vh',
						enter: function() {
							$intro.addClass('hidden');
						},
						leave: function() {
							$intro.removeClass('hidden');
						}
					});

				});

			// Hide intro on scroll (<= small).
				breakpoints.on('<=small', function() {

					$main.unscrollex();

					$main.scrollex({
						mode: 'middle',
						top: '15vh',
						bottom: '-15vh',
						enter: function() {
							$intro.addClass('hidden');
						},
						leave: function() {
							$intro.removeClass('hidden');
						}
					});

			});

		}

})(jQuery);

// Resume modal interactions (PDF.js viewer)
(function() {
	// PDF.js worker
	if (window.pdfjsLib) {
		window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
	}

	var pdfDoc = null;
	var pageNum = 1;
	var pageCount = 0;
	// baseScale is computed to fit the page to the modal container;
	// zoom is a user-controlled multiplier applied on top of baseScale.
	var baseScale = 1;
	var zoom = 1.1; // slightly larger by default so text fits better
	var zoomStep = 0.25;
	var minZoom = 0.5;
	var maxZoom = 4; // allow larger zoom when needed

	var canvas = null;
	var ctx = null;

	function renderPage(num) {
		if (!pdfDoc) return;
		pdfDoc.getPage(num).then(function(page) {
			// Compute a base scale so the page fits inside the modal container
			var unscaledViewport = page.getViewport({ scale: 1 });
			var container = document.querySelector('.resume-frame-wrapper');
			var containerWidth = container ? container.clientWidth - 20 : unscaledViewport.width; // padding
			var containerHeight = container ? container.clientHeight - 20 : unscaledViewport.height;

			var fitScaleW = containerWidth / unscaledViewport.width;
			var fitScaleH = containerHeight / unscaledViewport.height;
			baseScale = Math.min(fitScaleW, fitScaleH, 3);
			if (baseScale <= 0) baseScale = 1;

			var desiredScale = baseScale * zoom;

			var viewport = page.getViewport({ scale: desiredScale });

			// Handle high-DPI displays
			var outputScale = window.devicePixelRatio || 1;

			canvas.style.width = Math.floor(viewport.width) + 'px';
			canvas.style.height = Math.floor(viewport.height) + 'px';
			canvas.width = Math.floor(viewport.width * outputScale);
			canvas.height = Math.floor(viewport.height * outputScale);

			ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);

			var renderContext = {
				canvasContext: ctx,
				viewport: page.getViewport({ scale: desiredScale })
			};

			page.render(renderContext).promise.then(function() {
				document.getElementById('pageNum').textContent = pageNum;
			});
		}).catch(function(err) {
			console.error('Error rendering page:', err);
		});
	}

	function queueRenderPage(num) {
		if (num < 1) num = 1;
		if (num > pageCount) num = pageCount;
		pageNum = num;
		renderPage(pageNum);
	}

	function loadDocument(url) {
		if (!window.pdfjsLib) {
			console.error('pdfjsLib not found');
			return;
		}
		var loadingTask = window.pdfjsLib.getDocument(url);
		loadingTask.promise.then(function(pdf) {
			pdfDoc = pdf;
			pageCount = pdf.numPages;
			document.getElementById('pageCount').textContent = pageCount;
			pageNum = 1;
			renderPage(pageNum);
		}).catch(function(err) {
			console.error('Error loading PDF:', err);
		});
	}

	function openModal() {
		var modal = document.getElementById('resumeModal');
		if (!modal) return;
		modal.setAttribute('aria-hidden', 'false');
		// ensure canvas/context ready
		if (!canvas) {
			canvas = document.getElementById('resumeCanvas');
			if (canvas) ctx = canvas.getContext('2d');
		}
		// keep wrapper scroll position — center alignment preferred
		// load PDF if not loaded
		if (!pdfDoc) {
			loadDocument('assets/docs/resume.pdf');
		} else {
			renderPage(pageNum);
		}
	}

	function closeModal() {
		var modal = document.getElementById('resumeModal');
		if (!modal) return;
		modal.setAttribute('aria-hidden', 'true');
	}

	document.addEventListener('DOMContentLoaded', function() {
		var toggle = document.getElementById('resumeToggle');
		if (toggle) toggle.addEventListener('click', function(e) { e.preventDefault(); openModal(); });

		var closeBtn = document.getElementById('resumeClose');
		if (closeBtn) closeBtn.addEventListener('click', function() { closeModal(); });

		var prevBtn = document.getElementById('prevPage');
		var nextBtn = document.getElementById('nextPage');
		var zoomIn = document.getElementById('zoomIn');
		var zoomOut = document.getElementById('zoomOut');
		var zoomReset = document.getElementById('zoomReset');

		if (prevBtn) prevBtn.addEventListener('click', function() {
			if (pageNum <= 1) return;
			pageNum--;
			queueRenderPage(pageNum);
		});

		if (nextBtn) nextBtn.addEventListener('click', function() {
			if (pageNum >= pageCount) return;
			pageNum++;
			queueRenderPage(pageNum);
		});

		if (zoomIn) zoomIn.addEventListener('click', function() {
			zoom = Math.min(maxZoom, zoom + zoomStep);
			renderPage(pageNum);
		});
		if (zoomOut) zoomOut.addEventListener('click', function() {
			zoom = Math.max(minZoom, zoom - zoomStep);
			renderPage(pageNum);
		});
		if (zoomReset) zoomReset.addEventListener('click', function() {
			zoom = 1;
			renderPage(pageNum);
		});

		// Close when clicking backdrop
		var backdrop = document.querySelector('.resume-modal-backdrop');
		if (backdrop) backdrop.addEventListener('click', closeModal);

		// Ensure download link points to the PDF path
		var dl = document.getElementById('resumeDownload');
		if (dl) dl.setAttribute('href', 'assets/docs/resume.pdf');
	});
})();