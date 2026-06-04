// Lightweight interactions: carousel, reveal on scroll, parallax on hero
document.addEventListener('DOMContentLoaded',()=>{
	// Carousel simple next/prev
	const carousel = document.querySelector('[data-carousel]');
	if(carousel){
		const track = carousel.querySelector('.carousel-track');
		const next = carousel.querySelector('.nav-next');
		const prev = carousel.querySelector('.nav-prev');
		let idx = 0;
		const slides = Array.from(track.children);
		function update(){
			const w = track.clientWidth;
			const slide = slides[Math.max(0,Math.min(idx,slides.length-1))];
			const left = slide.offsetLeft - (w - slide.offsetWidth)/2;
			track.scrollTo({left,behavior:'smooth'});
		}
		next?.addEventListener('click',()=>{idx = Math.min(idx+1,slides.length-1); update();});
		prev?.addEventListener('click',()=>{idx = Math.max(idx-1,0); update();});
		// keyboard
		carousel.addEventListener('keydown',e=>{
			if(e.key==='ArrowRight') next?.click();
			if(e.key==='ArrowLeft') prev?.click();
		});

		// autoplay: change slide every 3 seconds for a smoother experience
		let autoplayInterval = 3000; // ms
		let autoplayTimer = null;
		function startAutoplay(){
			if(autoplayTimer) clearInterval(autoplayTimer);
			if(!slides || slides.length === 0) return;
			autoplayTimer = setInterval(()=>{ idx = (idx+1) % slides.length; update(); }, autoplayInterval);
		}
		function stopAutoplay(){ if(autoplayTimer) clearInterval(autoplayTimer); }
		carousel.addEventListener('mouseenter', stopAutoplay);
		carousel.addEventListener('mouseleave', startAutoplay);
		startAutoplay();
	}

		// Reveal on scroll with staggered delays
		const revealSelector = '.fade-in, .row-title, .card, .thumb, .genre, .movie-title, .card-info, .hero-card, .hero-card-row, .movie-hero .poster, .movie-hero .meta, .actions-row, .info-row, .spotlight, .spot-media, .spot-text, .spot-tag, .spot-highlights, .cta-row';
		const revealEls = Array.from(document.querySelectorAll(revealSelector));
		const io = new IntersectionObserver((entries)=>{
			entries.forEach(entry=>{
				if(entry.isIntersecting){
					entry.target.classList.add('visible');
					io.unobserve(entry.target);
				}
			});
		},{threshold:0.12});
		revealEls.forEach((el,i)=>{
			// small cyclic stagger to avoid huge cumulative delay
			const d = (i % 8) * 70; // up to ~560ms
			el.style.transitionDelay = d + 'ms';
			io.observe(el);
		});

	// Hero parallax subtle movement on scroll
	const heroBg = document.querySelector('.hero-bg');
	if(heroBg){
		window.addEventListener('scroll',()=>{
			const y = window.scrollY;
			heroBg.style.transform = `translateY(${y*0.12}px) scale(1.02)`;
		},{passive:true});
	}

	// If movie hero exists, toggle condensed header when scrolled past the hero
	const movieHero = document.querySelector('.movie-hero');
	const header = document.querySelector('.site-header');
	if(movieHero && header){
		const obs = new IntersectionObserver((entries)=>{
			entries.forEach(e=>{
				if(!e.isIntersecting) header.classList.add('condensed');
				else header.classList.remove('condensed');
			});
		},{root:null,threshold:0});
		obs.observe(movieHero);
	}

	// Hero card data and auto-rotate details
	const heroPosterCurrent = document.querySelector('.movie-hero .poster-current');
	const heroPosterNext = document.querySelector('.movie-hero .poster-next');
	const heroMeta = document.querySelector('.movie-hero .meta');
	const heroBadge = document.querySelector('.movie-hero .badge');
	const heroTitle = document.querySelector('.movie-hero .movie-title');
	const heroSubmeta = document.querySelector('.movie-hero .submeta');
	const heroDesc = document.querySelector('.movie-hero .movie-desc');
	const heroInfo = document.querySelector('.movie-hero .info-row');
	const heroCards = Array.from(document.querySelectorAll('.hero-card'));
	const heroMovies = [
		{
			image: 'ott1.webp',
			title: 'Sample Movie Title',
			badge: 'Included with Stackly',
			subtitle: '2024 • 2h 13m • Action, Drama • U/A 16+',
			desc: 'A gripping story of courage and betrayal. This sample synopsis mirrors the feel of the Prime Video movie detail page — bold, concise and enticing.',
			info: [{label:'Starring:', value:'Actor A, Actor B, Actor C'}, {label:'Director:', value:'Director Name'}]
		},
		{
			image: 'ott3.webp',
			title: 'Neon Runners',
			badge: 'New on Stackly',
			subtitle: '2025 • 2h 4m • Crime, Thriller • U/A 16+',
			desc: 'A fast-paced chase through neon-lit city streets where every second counts and loyalties are tested.',
			info: [{label:'Starring:', value:'Actor D, Actor E, Actor F'}, {label:'Director:', value:'Director Name'}]
		},
		{
			image: 'ott7.webp',
			title: 'Dark Horizons',
			badge: 'Featured collection',
			subtitle: '2024 • 1h 58m • Sci-fi, Drama • U/A 16+',
			desc: 'An epic sci-fi adventure that explores hope, sacrifice, and the unknown corners of space.',
			info: [{label:'Starring:', value:'Actor G, Actor H'}, {label:'Director:', value:'Director Name'}]
		},
		{
			image: 'ott9.webp',
			title: 'City Patrol',
			badge: 'Trending now',
			subtitle: '2024 • 2h 12m • Action, Crime • U/A 16+',
			desc: 'A gritty action thriller that follows a relentless police squad as they hunt down a dangerous syndicate.',
			info: [{label:'Starring:', value:'Actor I, Actor J'}, {label:'Director:', value:'Director Name'}]
		}
	];
	let heroIndex = 0;

	function updateHero(movieIndex, animate=true){
		const movie = heroMovies[movieIndex];
		if(!movie || !heroPosterCurrent || !heroPosterNext) return;
		heroCards.forEach(card=>card.classList.toggle('active', Number(card.dataset.movie) === movieIndex));
		if(!animate){
			heroPosterCurrent.style.backgroundImage = `url('${movie.image}')`;
			heroPosterNext.style.opacity = 0;
			heroBadge.textContent = movie.badge;
			heroTitle.textContent = movie.title;
			heroSubmeta.textContent = movie.subtitle;
			heroDesc.textContent = movie.desc;
			heroInfo.innerHTML = movie.info.map(item=>`<div><strong>${item.label}</strong> ${item.value}</div>`).join('');
			return;
		}

		heroPosterNext.style.backgroundImage = `url('${movie.image}')`;
		heroPosterNext.classList.add('fade-in');
		heroPosterCurrent.classList.add('fade-out');
		heroMeta.classList.add('fade-out');
		setTimeout(()=>{
			heroPosterCurrent.style.backgroundImage = `url('${movie.image}')`;
			heroPosterNext.classList.remove('fade-in');
			heroPosterCurrent.classList.remove('fade-out');
			heroPosterNext.style.opacity = 0;
			heroMeta.classList.remove('fade-out');
			heroBadge.textContent = movie.badge;
			heroTitle.textContent = movie.title;
			heroSubmeta.textContent = movie.subtitle;
			heroDesc.textContent = movie.desc;
			heroInfo.innerHTML = movie.info.map(item=>`<div><strong>${item.label}</strong> ${item.value}</div>`).join('');
		}, 450);
	}

	heroCards.forEach(card=>{
		card.addEventListener('click', ()=>{
			heroIndex = Number(card.dataset.movie);
			updateHero(heroIndex);
		});
	});

	if(heroCards.length){
		updateHero(heroIndex, false);
		setInterval(()=>{
			heroIndex = (heroIndex + 1) % heroMovies.length;
			updateHero(heroIndex);
		}, 7000);
	}

	// Play, Watchlist, Share buttons: redirect to 404 page (for demo linking)
	document.body.addEventListener('click', (ev)=>{
		const btn = ev.target.closest('button');
		if(!btn) return;
		const text = btn.textContent.trim().toLowerCase();
		const isPlay = btn.classList.contains('play') || text.includes('▶') || text.includes('play');
		const isWatchlist = text.includes('watchlist');
		const isShare = text.includes('share');
		if(isPlay || isWatchlist || isShare){
			ev.preventDefault();
			window.location.href = '404.html';
		}
	});

	// Sign In modal
	const signInBtn = document.getElementById('sign-in-btn');
	const authModal = document.getElementById('auth-modal');
	const authCloseTargets = authModal ? authModal.querySelectorAll('.close, #auth-cancel') : [];
	const authForm = document.getElementById('auth-form');

	// Mobile hamburger menu toggle
	const mobileMenuBtn = document.getElementById('mobileMenuBtn');
	const mobileMenuPanel = document.getElementById('mobileMenuPanel');
	if(mobileMenuBtn && mobileMenuPanel){
		mobileMenuBtn.addEventListener('click',(e)=>{
			e.stopPropagation();
			const isOpen = mobileMenuPanel.classList.toggle('open');
			mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
			mobileMenuPanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
		});
		mobileMenuPanel.querySelectorAll('a').forEach(link=>{
			link.addEventListener('click',()=>{
				mobileMenuPanel.classList.remove('open');
				mobileMenuBtn.setAttribute('aria-expanded','false');
				mobileMenuPanel.setAttribute('aria-hidden','true');
			});
		});
		document.addEventListener('click',(e)=>{
			if(!mobileMenuPanel.contains(e.target) && !mobileMenuBtn.contains(e.target) && mobileMenuPanel.classList.contains('open')){
				mobileMenuPanel.classList.remove('open');
				mobileMenuBtn.setAttribute('aria-expanded','false');
				mobileMenuPanel.setAttribute('aria-hidden','true');
			}
		});
	}


	if(signInBtn && authModal){
		signInBtn.addEventListener('click', (e)=>{
			e.preventDefault();
			authModal.classList.add('open');
			authModal.removeAttribute('aria-hidden');
			document.body.style.overflow = 'hidden';
			authModal.querySelector('#auth-email')?.focus();
		});
	}

	authCloseTargets.forEach(el=>{
		el.addEventListener('click',()=>{
			authModal.classList.remove('open');
			authModal.setAttribute('aria-hidden','true');
			document.body.style.overflow = '';
		});
	});

	if(authModal){
		authModal.addEventListener('click',(ev)=>{
			if(ev.target === authModal){
				authModal.classList.remove('open');
				authModal.setAttribute('aria-hidden','true');
				document.body.style.overflow = '';
			}
		});
		document.addEventListener('keydown',(ev)=>{
			if(ev.key === 'Escape' && authModal.classList.contains('open')){
				authModal.classList.remove('open');
				authModal.setAttribute('aria-hidden','true');
				document.body.style.overflow = '';
			}
		});
	}

	if(authForm){
		authForm.addEventListener('submit',(ev)=>{
			ev.preventDefault();
			const email = document.getElementById('auth-email').value;
			const pass = document.getElementById('auth-pass').value;
			const btn = authForm.querySelector('button[type=submit]');
			if(!email.includes('@') || pass.length < 4){
				btn.textContent = 'Try again';
				setTimeout(()=>btn.textContent = 'Sign In', 1100);
				return;
			}
			btn.textContent = 'Signing in...';
			btn.disabled = true;
			setTimeout(()=>{
				authModal.classList.remove('open');
				authModal.setAttribute('aria-hidden','true');
				document.body.style.overflow = '';
				btn.textContent = 'Sign In';
				btn.disabled = false;
				alert('Signed in to Stackly! (demo)');
			},1000);
		});
	}

	// close video modal
	document.body.addEventListener('click',(ev)=>{
		if(ev.target.matches('.video-modal .close') || ev.target.matches('.video-modal')){
			document.querySelectorAll('.video-modal').forEach(m=>m.remove());
		}
	});

		// Add tilt-on-hover effect (mouse move) for posters and thumbs
		function attachTilt(selector, strength=12){
			const els = document.querySelectorAll(selector);
			els.forEach(el=>{
				let raf = null;
				el.addEventListener('mousemove', (e)=>{
					const r = el.getBoundingClientRect();
					const px = (e.clientX - r.left) / r.width;
					const py = (e.clientY - r.top) / r.height;
					const rotateY = (px - 0.5) * strength;
					const rotateX = (0.5 - py) * strength;
					if(raf) cancelAnimationFrame(raf);
					raf = requestAnimationFrame(()=>{
						el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
					});
				});
				el.addEventListener('mouseleave', ()=>{
					if(raf) cancelAnimationFrame(raf);
					el.style.transform = '';
				});
			});
		}
		attachTilt('.poster, .thumb, .card', 10);

		// Parallax for poster and spot-media
		const parallaxEls = document.querySelectorAll('.poster, .spot-media');
		if(parallaxEls.length){
			window.addEventListener('scroll', ()=>{
				const y = window.scrollY;
				parallaxEls.forEach(el=>{
					const r = el.getBoundingClientRect();
					const offset = (window.innerHeight - r.top) / (window.innerHeight + r.height);
					const translate = Math.max(-30, Math.min(30, (offset - 0.5) * 40));
					el.style.transform = `translateY(${translate * 0.6}px)`;
				});
			},{passive:true});
		}

	// Small touch: lazy load images (modern browsers)
	document.querySelectorAll('img').forEach(img=>{
		img.loading = 'lazy';
	});

	// subtle page-wide mousemove parallax (throttled via rAF)
	(function(){
		let raf = null;
		let mx = 0, my = 0;
		function onMove(e){
			mx = (e.clientX / window.innerWidth) - 0.5; // -0.5..0.5
			my = (e.clientY / window.innerHeight) - 0.5;
			if(raf) return;
			raf = requestAnimationFrame(()=>{
				raf = null;
				// gentle background parallax for hero
				const hb = document.querySelector('.hero-bg');
				if(hb){
					hb.style.transform = `translate(${mx*8}px, ${my*6}px) scale(1.04)`;
				}
				// subtle root hue shift for accent highlight
				document.documentElement.style.setProperty('--accent-2', `hsl(${265 + mx*8}deg 85% 65%)`);
			});
		}
		document.addEventListener('mousemove', onMove);
	})();

	// Tabs behavior
	const tabs = document.querySelectorAll('.tab');
	if(tabs.length){
		tabs.forEach(btn=>btn.addEventListener('click',()=>{
			const name = btn.dataset.tab;
			// toggle active
			document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
			btn.classList.add('active');
			// panels
			document.querySelectorAll('.tab-panels .panel').forEach(p=>{p.hidden = (p.id !== name)});
		}));
	}

	// Row scroller controls: support mouse wheel to scroll horizontally and load-more
	document.querySelectorAll('[data-scroller]').forEach(sc=>{
		sc.addEventListener('wheel', (e)=>{
			e.preventDefault();
			sc.scrollBy({left: e.deltaY < 0 ? -200 : 200, behavior:'smooth'});
		});

		// inject arrow buttons for click scrolling
		const rowSection = sc.closest('.row-section') || sc.parentElement;
		if(rowSection && !rowSection.querySelector('.scroller-nav')){
			const nav = document.createElement('div');
			nav.className = 'scroller-nav';
			nav.innerHTML = `<button class="nav-left" aria-label="Scroll left">‹</button><button class="nav-right" aria-label="Scroll right">›</button>`;
			rowSection.appendChild(nav);
			const left = nav.querySelector('.nav-left');
			const right = nav.querySelector('.nav-right');
			function updateButtons(){
				left.disabled = sc.scrollLeft <= 8;
				right.disabled = Math.ceil(sc.scrollLeft + sc.clientWidth) >= sc.scrollWidth - 8;
				// hide if no overflow
				nav.style.display = sc.scrollWidth > sc.clientWidth + 4 ? 'flex' : 'none';
			}
			left.addEventListener('click', ()=>{
				sc.scrollBy({left: -Math.round(sc.clientWidth * 0.7), behavior:'smooth'});
				setTimeout(updateButtons, 260);
			});
			right.addEventListener('click', ()=>{
				sc.scrollBy({left: Math.round(sc.clientWidth * 0.7), behavior:'smooth'});
				setTimeout(updateButtons, 260);
			});
			// keep buttons state in sync
			sc.addEventListener('scroll', updateButtons, {passive:true});
			window.addEventListener('resize', updateButtons);
			updateButtons();
		}
	});

	// Load more buttons: clone current items to simulate more results
	document.querySelectorAll('.load-more').forEach(btn=>{
		btn.addEventListener('click', ()=>{
			const target = btn.dataset.target;
			const scroller = document.querySelector('.row-scroller');
			if(scroller){
				const clones = Array.from(scroller.children).slice(0,3).map(n=>n.cloneNode(true));
				clones.forEach(c=>scroller.appendChild(c));
				btn.textContent = 'Loaded';
				setTimeout(()=>btn.textContent='Load more',1200);
			}
		});
	});

	// Back to top button
	const back = document.getElementById('back-to-top');
	if(back){
		const showAt = 400;
		window.addEventListener('scroll', ()=>{
			if(window.scrollY > showAt) back.classList.add('show'); else back.classList.remove('show');
		},{passive:true});
		back.addEventListener('click', ()=>{
			window.scrollTo({top:0,behavior:'smooth'});
		});
	}

	// Newsletter submit (mock)
	const newsletter = document.getElementById('newsletter-form');
	if(newsletter){
		newsletter.addEventListener('submit',(e)=>{
			e.preventDefault();
			const email = document.getElementById('newsletter-email').value;
			// simple validation
			if(!email || !email.includes('@')){
				alert('Please enter a valid email');
				return;
			}
			const btn = newsletter.querySelector('button');
			const prev = btn.textContent;
			btn.textContent = 'Subscribed';
			btn.disabled = true;
			setTimeout(()=>{btn.textContent = prev; btn.disabled=false; newsletter.reset(); alert('Thanks — subscription simulated.');},1200);
		});
	}
});

// Hover preview panel: populate and show the large preview when hovering tv-cards
document.addEventListener('DOMContentLoaded', ()=>{
	const panel = document.getElementById('preview-panel');
	if(!panel) return;
	const poster = panel.querySelector('.preview-poster');
	const titleEl = panel.querySelector('.preview-title');
	const metaEl = panel.querySelector('.preview-meta');
	const descEl = panel.querySelector('.preview-desc');
	const closeBtn = panel.querySelector('.preview-close');
	let hideTimer = null;

	function showPanelFor(card){
		const details = card.querySelector('.card-details');
		if(!details) return;
		titleEl.textContent = details.querySelector('.card-title')?.textContent || '';
		metaEl.textContent = details.querySelector('.card-meta')?.textContent || '';
		descEl.textContent = details.querySelector('.card-desc')?.textContent || '';
		// poster if provided as inline style
		const bg = card.style.backgroundImage || '';
		if(bg && bg !== 'none') poster.style.backgroundImage = bg; else poster.style.backgroundImage = '';
		// make panel visible first so we can measure its size
		panel.style.left = '-9999px';
		panel.classList.add('open');
		panel.setAttribute('aria-hidden','false');
		// compute position relative to viewport
		const r = card.getBoundingClientRect();
		const pRect = panel.getBoundingClientRect();
		const pW = pRect.width || 420;
		const pH = pRect.height || 320;
		// prefer above the card; fall back to below if not enough space
		let top = r.top - pH - 12;
		if(top < 48) top = r.bottom + 12;
		// center panel horizontally on card, but clamp to viewport
		const desiredLeft = r.left + (r.width / 2) - (pW / 2);
		const minLeft = 8;
		const maxLeft = Math.max(8, window.innerWidth - pW - 8);
		const left = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
		panel.style.top = Math.round(top) + 'px';
		panel.style.left = Math.round(left) + 'px';
	}

	function hidePanel(){
		panel.classList.remove('open');
		panel.setAttribute('aria-hidden','true');
	}

	document.querySelectorAll('.tv-card').forEach(card=>{
		card.addEventListener('mouseenter', ()=>{
			clearTimeout(hideTimer);
			showPanelFor(card);
		});
		card.addEventListener('mouseleave', ()=>{
			hideTimer = setTimeout(hidePanel, 220);
		});
	});

	panel.addEventListener('mouseenter', ()=>{ clearTimeout(hideTimer); });
	panel.addEventListener('mouseleave', ()=>{ hidePanel(); });
	closeBtn.addEventListener('click', ()=>{ hidePanel(); });
});

// Mega menu hover behaviour: show/hide the large dropdown and route links to 404
(function(){
	const moviesLink = document.querySelector('.main-nav a[data-mega="movies"]');
	const menu = document.getElementById('mega-movies');
	if(!moviesLink || !menu) return;
	let openTimer = null, closeTimer = null;

	function openMenu(){
		clearTimeout(closeTimer);
		menu.classList.add('open');
		menu.setAttribute('aria-hidden','false');
	}
	function closeMenu(){
		clearTimeout(openTimer);
		menu.classList.remove('open');
		menu.setAttribute('aria-hidden','true');
	}

	// hover on Movies link
	moviesLink.addEventListener('mouseenter', ()=>{ clearTimeout(closeTimer); openTimer = setTimeout(openMenu, 50); });
	moviesLink.addEventListener('mouseleave', ()=>{ closeTimer = setTimeout(closeMenu, 250); });

	// keep menu open when hovering it
	menu.addEventListener('mouseenter', ()=>{ clearTimeout(closeTimer); });
	menu.addEventListener('mouseleave', ()=>{ closeTimer = setTimeout(closeMenu, 250); });

	// keyboard support
	moviesLink.addEventListener('focus', openMenu);
	moviesLink.addEventListener('blur', ()=>{ closeTimer = setTimeout(closeMenu, 300); });

	// all links in menu go to 404
	menu.querySelectorAll('a').forEach(a=>{
		a.addEventListener('click', (ev)=>{
			ev.preventDefault();
			window.location.href = '404.html';
		});
	});
})();

