const firebaseConfig = {
    apiKey: "AIzaSyDhzHU80xdBywyK9WtS0mlZhNPYIA3XKkA",
    authDomain: "dao-treasury-wallet-3b7a1.firebaseapp.com",
    projectId: "dao-treasury-wallet-3b7a1",
    storageBucket: "dao-treasury-wallet-3b7a1.firebasestorage.app",
    messagingSenderId: "307009904821",
    appId: "1:307009904821:web:5a011aaa467b591a9c9efc"
  };
  
  
  let firebaseApp;
  let db;
  
  async function initializeFirebase() {
      try {
          const { initializeApp, getFirestore, collection, doc, setDoc, getDocs } = window.firebaseModules;
          
          firebaseApp = initializeApp(firebaseConfig);
          db = getFirestore(firebaseApp);
          
          console.log('✅ Firebase initialized successfully');
          
          await testFirestoreConnection();
          
      } catch (error) {
          console.error('❌ Firebase initialization error:', error);
          showToast('Firebase Connection Failed', 'error');
      }
  }
  
  async function testFirestoreConnection() {
      try {
          const { doc, setDoc, getDocs, collection } = window.firebaseModules;
          
          const testDoc = doc(db, 'dao_config', 'treasury_info');
          
          await setDoc(testDoc, {
              dao_name: 'Community Treasury',
              created_at: new Date().toISOString(),
              status: 'active'
          });
          
          console.log('✅ Test document written successfully');
          
          const querySnapshot = await getDocs(collection(db, 'dao_config'));
          querySnapshot.forEach((doc) => {
              console.log('📄 Document ID:', doc.id);
              console.log('📋 Document data:', doc.data());
          });
          
          showToast('Connected to Firestore ✨', 'success');
          
      } catch (error) {
          console.log('❌ Firestore error:', error.code || error.message);
          console.log('');
          console.log('📋 TO FIX THIS ISSUE:');
          console.log('1. Open https://console.firebase.google.com');
          console.log('2. Select project: dao-treasury-wallet');
          console.log('3. Go to Firestore Database in left sidebar');
          console.log('4. Click CREATE DATABASE button');
          console.log('5. Select TEST MODE for development');
          console.log('6. Choose your region and click Enable');
          console.log('');
          console.log('📄 See FIREBASE_SETUP.md for detailed instructions');
          
          showToast('Firestore: Create database in Firebase Console', 'warning');
      }
  }
  
  function showToast(message, type = 'success') {
      const toastContainer = document.getElementById('toast-container');
      
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      const icon = type === 'success' ? '✨' : '⚠️';
      
      toast.innerHTML = `
          <div class="toast-icon">${icon}</div>
          <div class="toast-message">${message}</div>
          <div class="toast-glow"></div>
      `;
      
      toastContainer.appendChild(toast);
      
      setTimeout(() => {
          toast.classList.add('toast-show');
      }, 100);
      
      setTimeout(() => {
          toast.classList.remove('toast-show');
          setTimeout(() => {
              toast.remove();
          }, 400);
      }, 4000);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
      const navLinks = document.querySelectorAll('.nav-link');
      const sections = document.querySelectorAll('section[id]');
      const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
      const navLinksContainer = document.querySelector('.nav-links');
  
      if (window.firebaseModules) {
          initializeFirebase();
      } else {
          console.error('❌ Firebase modules not loaded');
          showToast('Firebase modules not loaded', 'error');
      }
  
      navLinks.forEach(link => {
          link.addEventListener('click', (e) => {
              if (link.getAttribute('href').startsWith('#')) {
                  e.preventDefault();
                  const targetId = link.getAttribute('href');
                  const targetSection = document.querySelector(targetId);
                  
                  if (targetSection) {
                      const offsetTop = targetSection.offsetTop - 80;
                      window.scrollTo({
                          top: offsetTop,
                          behavior: 'smooth'
                      });
                  }
  
                  navLinks.forEach(l => l.classList.remove('active'));
                  link.classList.add('active');
  
                  if (window.innerWidth <= 768) {
                      navLinksContainer.classList.remove('active');
                      mobileMenuToggle.classList.remove('active');
                  }
              }
          });
      });
  
      let scrollTimeout;
      window.addEventListener('scroll', () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
              let current = '';
              sections.forEach(section => {
                  const sectionTop = section.offsetTop - 100;
                  const sectionHeight = section.clientHeight;
                  if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                      current = section.getAttribute('id');
                  }
              });
  
              navLinks.forEach(link => {
                  link.classList.remove('active');
                  if (link.getAttribute('href') === `#${current}`) {
                      link.classList.add('active');
                  }
              });
          }, 100);
      });
  
      if (mobileMenuToggle) {
          mobileMenuToggle.addEventListener('click', () => {
              navLinksContainer.classList.toggle('active');
              mobileMenuToggle.classList.toggle('active');
          });
      }
  
      const cards = document.querySelectorAll('.stat-card, .proposal-card, .treasury-card');
      const observerOptions = {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
      };
  
      const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry, index) => {
              if (entry.isIntersecting) {
                  setTimeout(() => {
                      entry.target.style.opacity = '1';
                      entry.target.style.transform = 'translateY(0)';
                  }, index * 100);
                  
                  observer.unobserve(entry.target);
              }
          });
      }, observerOptions);
  
      cards.forEach(card => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(30px)';
          card.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          observer.observe(card);
      });
  
      const connectWalletBtn = document.querySelector('.connect-wallet-btn');
      if (connectWalletBtn) {
          connectWalletBtn.addEventListener('click', (e) => {
              e.preventDefault();
              createRippleEffect(e, connectWalletBtn);
          });
      }
  
      const buttons = document.querySelectorAll('.btn');
      buttons.forEach(button => {
          button.addEventListener('click', (e) => {
              createRippleEffect(e, button);
          });
  
          button.addEventListener('mousemove', (e) => {
              const rect = button.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              
              button.style.setProperty('--mouse-x', `${x}%`);
              button.style.setProperty('--mouse-y', `${y}%`);
          });
      });
  
      function createRippleEffect(e, element) {
          const ripple = document.createElement('span');
          const rect = element.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          
          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          ripple.classList.add('ripple-effect');
          
          element.appendChild(ripple);
          
          setTimeout(() => ripple.remove(), 600);
      }
  
      const proposalCards = document.querySelectorAll('.proposal-card');
      const treasuryCards = document.querySelectorAll('.treasury-card');
      const allInteractiveCards = [...proposalCards, ...treasuryCards];
  
      allInteractiveCards.forEach(card => {
          card.addEventListener('mousemove', (e) => {
              const rect = card.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              
              const rotateX = (y - centerY) / 20;
              const rotateY = (centerX - x) / 20;
              
              card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px)`;
          });
  
          card.addEventListener('mouseleave', () => {
              card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
          });
      });
  
      let cursorX = 0;
      let cursorY = 0;
      let cursorVisible = false;
  
      document.addEventListener('mousemove', (e) => {
          cursorX = e.clientX;
          cursorY = e.clientY;
          
          if (!cursorVisible) {
              cursorVisible = true;
          }
          
          updateCursorGlow();
      });
  
      function updateCursorGlow() {
          const glowElement = document.querySelector('.cursor-glow');
          if (glowElement) {
              glowElement.style.left = `${cursorX}px`;
              glowElement.style.top = `${cursorY}px`;
          }
      }
  
      const cursorGlow = document.createElement('div');
      cursorGlow.className = 'cursor-glow';
      document.body.appendChild(cursorGlow);
  
      const style = document.createElement('style');
      style.textContent = `
          .ripple-effect {
              position: absolute;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.6);
              transform: scale(0);
              animation: ripple-animation 0.6s ease-out;
              pointer-events: none;
          }
          
          @keyframes ripple-animation {
              to {
                  transform: scale(4);
                  opacity: 0;
              }
          }
  
          .cursor-glow {
              position: fixed;
              width: 500px;
              height: 500px;
              background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
              border-radius: 50%;
              pointer-events: none;
              transform: translate(-50%, -50%);
              transition: left 0.15s ease, top 0.15s ease;
              z-index: 999;
              mix-blend-mode: screen;
          }
  
          @media (max-width: 768px) {
              .cursor-glow {
                  display: none;
              }
          }
      `;
      document.head.appendChild(style);
  
      const progressBars = document.querySelectorAll('.progress-bar');
      const progressObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  const bar = entry.target;
                  const width = bar.style.width;
                  bar.style.width = '0';
                  setTimeout(() => {
                      bar.style.width = width;
                  }, 100);
                  progressObserver.unobserve(bar);
              }
          });
      }, { threshold: 0.5 });
  
      progressBars.forEach(bar => progressObserver.observe(bar));
  
      window.addEventListener('scroll', () => {
          const scrolled = window.pageYOffset;
          const parallax = document.querySelector('.grid-background');
          if (parallax) {
              parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
          }
      });
  
      const statCards = document.querySelectorAll('.stat-card');
      statCards.forEach(card => {
          const value = card.querySelector('.stat-value');
          if (value) {
              const finalValue = value.textContent;
              
              const statObserver = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                      if (entry.isIntersecting) {
                          animateValue(value, finalValue);
                          statObserver.unobserve(entry.target);
                      }
                  });
              }, { threshold: 0.5 });
              
              statObserver.observe(card);
          }
      });
  
      function animateValue(element, finalValue) {
          const numMatch = finalValue.match(/[\d.]+/);
          if (numMatch) {
              const num = parseFloat(numMatch[0]);
              const numStr = numMatch[0];
              const numIndex = finalValue.indexOf(numStr);
              const prefix = finalValue.substring(0, numIndex);
              const suffix = finalValue.substring(numIndex + numStr.length);
              
              const duration = 1500;
              const steps = 60;
              const increment = num / steps;
              let current = 0;
              let step = 0;
  
              const decimals = numStr.includes('.') ? 1 : 0;
  
              const timer = setInterval(() => {
                  current += increment;
                  step++;
                  element.textContent = prefix + current.toFixed(decimals) + suffix;
                  
                  if (step >= steps) {
                      element.textContent = finalValue;
                      clearInterval(timer);
                  }
              }, duration / steps);
          }
      }
  
      const mainButtons = document.querySelectorAll('.btn-primary');
      mainButtons.forEach(btn => {
          btn.addEventListener('mouseenter', function() {
              this.style.transform = 'translateY(-3px) scale(1.02)';
          });
          
          btn.addEventListener('mouseleave', function() {
              this.style.transform = 'translateY(0) scale(1)';
          });
      });
  
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) {
              const href = this.getAttribute('href');
              if (href !== '#') {
                  e.preventDefault();
                  const target = document.querySelector(href);
                  if (target) {
                      const offset = 80;
                      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                      window.scrollTo({
                          top: targetPosition,
                          behavior: 'smooth'
                      });
                  }
              }
          });
      });

      let userWalletAddress = null;

      async function checkFreighterInstalled() {
          // Wait for the Freighter API library to load
          // The API might be exposed as window.freighterApi or through a module
          let freighterApi = window.freighterApi;
          
          // Wait for the script to load if not available yet
          if (!freighterApi) {
              await new Promise((resolve) => {
                  const maxAttempts = 30;
                  let attempts = 0;
                  const check = setInterval(() => {
                      attempts++;
                      freighterApi = window.freighterApi;
                      if (freighterApi || attempts >= maxAttempts) {
                          clearInterval(check);
                          resolve();
                      }
                  }, 100);
              });
          }
          
          if (!freighterApi) {
              return false;
          }
          
          // Check if we can communicate with the extension
          try {
              // Try to use isConnected() if available
              if (typeof freighterApi.isConnected === 'function') {
                  const connectionStatus = await freighterApi.isConnected();
                  // If we get a response (even if not connected), extension is installed
                  return connectionStatus !== undefined;
              }
              
              // Fallback: check if getAddress method exists (newer API)
              // Note: getAddress will throw if extension not installed
              if (typeof freighterApi.getAddress === 'function') {
                  // Just checking if method exists means API is loaded
                  return true;
              }
              
              return false;
          } catch (error) {
              // If methods exist but throw errors, extension might be installed
              // but not connected - still return true if API is available
              return typeof freighterApi.getAddress === 'function' ||
                     typeof freighterApi.isConnected === 'function';
          }
      }

      async function connectFreighterWallet() {
          try {
              // Check if Freighter is installed
              const isInstalled = await checkFreighterInstalled();
              
              if (!isInstalled || !window.freighterApi) {
                  showFreighterWarning();
                  return;
              }

              showToast('Requesting wallet access...', 'success');

              // Request access to the wallet first (if needed)
              let isAllowed = false;
              try {
                  if (typeof window.freighterApi.isAllowed === 'function') {
                      const allowed = await window.freighterApi.isAllowed();
                      isAllowed = allowed === true || allowed?.isAllowed === true;
                  }
                  
                  if (!isAllowed && typeof window.freighterApi.requestAccess === 'function') {
                      console.log('🔐 Requesting wallet access...');
                      await window.freighterApi.requestAccess();
                  } else if (typeof window.freighterApi.setAllowed === 'function') {
                      // Alternative method to set permissions
                      await window.freighterApi.setAllowed();
                  }
              } catch (accessError) {
                  console.log('Access request:', accessError.message || 'already has access');
                  // Continue anyway - might already have access
              }

              // Get wallet address from Freighter (new API uses getAddress instead of getPublicKey)
              let publicKey;
              let addressResponse;
              
              if (typeof window.freighterApi.getAddress === 'function') {
                  addressResponse = await window.freighterApi.getAddress();
                  console.log('🔍 getAddress response:', addressResponse, 'type:', typeof addressResponse);
                  
                  // Handle different response formats
                  if (typeof addressResponse === 'string') {
                      publicKey = addressResponse;
                  } else if (addressResponse && typeof addressResponse === 'object') {
                      // Try common property names
                      publicKey = addressResponse.address || 
                                  addressResponse.publicKey || 
                                  addressResponse.pubKey ||
                                  addressResponse.wallet ||
                                  (Array.isArray(addressResponse) ? addressResponse[0] : null);
                      
                      // If still not a string, try converting
                      if (publicKey && typeof publicKey !== 'string') {
                          publicKey = String(publicKey);
                      }
                  } else {
                      publicKey = addressResponse;
                  }
              } else if (typeof window.freighterApi.getPublicKey === 'function') {
                  // Fallback for older API versions
                  addressResponse = await window.freighterApi.getPublicKey();
                  console.log('🔍 getPublicKey response:', addressResponse, 'type:', typeof addressResponse);
                  
                  if (typeof addressResponse === 'string') {
                      publicKey = addressResponse;
                  } else if (addressResponse && typeof addressResponse === 'object') {
                      publicKey = addressResponse.address || 
                                  addressResponse.publicKey || 
                                  addressResponse.pubKey ||
                                  (Array.isArray(addressResponse) ? addressResponse[0] : null);
                      
                      if (publicKey && typeof publicKey !== 'string') {
                          publicKey = String(publicKey);
                      }
                  } else {
                      publicKey = addressResponse;
                  }
              } else {
                  throw new Error('Freighter API does not have getAddress or getPublicKey method');
              }
              
              // Ensure publicKey is a string and valid
              if (!publicKey) {
                  console.error('❌ No address received. Response:', addressResponse);
                  throw new Error('No wallet address received from Freighter');
              }
              
              // Convert to string if not already
              publicKey = String(publicKey).trim();
              
              // Validate Stellar address format (should start with G and be 56 chars)
              if (!publicKey.startsWith('G') || publicKey.length !== 56) {
                  console.error('⚠️ Invalid Stellar address format:', publicKey);
                  // Still allow it, but log warning
              }
              
              console.log('✅ Extracted wallet address:', publicKey);
              
              if (publicKey) {
                  userWalletAddress = publicKey;
                  
                  const shortAddress = `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}`;
                  
                  const walletDisplay = document.getElementById('wallet-display');
                  const walletText = walletDisplay.querySelector('.wallet-text');
                  walletText.textContent = shortAddress;
                  walletText.title = publicKey;
                  
                  walletDisplay.style.display = 'flex';
                  
                  const connectBtn = document.getElementById('connect-wallet-btn');
                  connectBtn.style.display = 'none';
                  
                  // Get network information
                  let network = 'unknown';
                  let networkDetails = null;
                  try {
                      if (typeof window.freighterApi.getNetwork === 'function') {
                          network = await window.freighterApi.getNetwork();
                      }
                      if (typeof window.freighterApi.getNetworkDetails === 'function') {
                          networkDetails = await window.freighterApi.getNetworkDetails();
                      }
                  } catch (netError) {
                      console.warn('Could not get network info:', netError);
                  }
                  
                  // Save to Firestore with complete information
                  await saveWalletToFirestore(publicKey, network, networkDetails);
                  
                  showToast(`Connected: ${shortAddress}`, 'success');
                  
                  console.log('✅ Wallet connected:', publicKey);
                  console.log('📊 Network:', network);
                  if (networkDetails) {
                      console.log('🌐 Network Details:', networkDetails);
                  }
              }
              
          } catch (error) {
              console.error('❌ Freighter connection error:', error);
              if (error.message && (error.message.includes('User declined') || error.message.includes('denied'))) {
                  showToast('Connection request declined', 'warning');
              } else if (error.message && error.message.includes('not installed')) {
                  showFreighterWarning();
              } else {
                  showToast(`Failed to connect wallet: ${error.message || 'Unknown error'}`, 'error');
              }
          }
      }

      async function saveWalletToFirestore(publicKey, network = 'unknown', networkDetails = null) {
          try {
              if (!db) {
                  console.warn('⚠️ Firestore not initialized');
                  return;
              }

              const { doc, setDoc } = window.firebaseModules;
              
              // Save user wallet connection
              const userDoc = doc(db, 'wallets', publicKey);
              
              const walletData = {
                  wallet_address: publicKey,
                  connected_at: new Date().toISOString(),
                  last_seen: new Date().toISOString(),
                  network: network,
                  status: 'connected'
              };
              
              // Add network details if available
              if (networkDetails) {
                  walletData.network_details = networkDetails;
              }
              
              await setDoc(userDoc, walletData, { merge: true });
              
              console.log('✅ Wallet saved to Firestore:', publicKey);
              
              // Also save a connection log entry
              try {
                  const { collection, addDoc } = window.firebaseModules;
                  await addDoc(collection(db, 'connection_logs'), {
                      wallet_address: publicKey,
                      connected_at: new Date().toISOString(),
                      network: network,
                      action: 'connected'
                  });
                  console.log('✅ Connection log saved');
              } catch (logError) {
                  console.warn('Could not save connection log:', logError);
              }
              
          } catch (error) {
              console.error('❌ Error saving to Firestore:', error);
              console.error('Error details:', error.message, error.code);
              showToast('Wallet connected but could not save to database', 'warning');
          }
      }

      function showFreighterWarning() {
          const warning = document.getElementById('freighter-warning');
          warning.style.display = 'flex';
      }

      function hideFreighterWarning() {
          const warning = document.getElementById('freighter-warning');
          warning.style.display = 'none';
      }

      const walletBtn = document.getElementById('connect-wallet-btn');
      if (walletBtn) {
          walletBtn.addEventListener('click', (e) => {
              e.preventDefault();
              connectFreighterWallet();
          });
      }

      const warningClose = document.getElementById('warning-close');
      if (warningClose) {
          warningClose.addEventListener('click', hideFreighterWarning);
      }

      const freighterWarning = document.getElementById('freighter-warning');
      if (freighterWarning) {
          freighterWarning.addEventListener('click', (e) => {
              if (e.target === freighterWarning) {
                  hideFreighterWarning();
              }
          });
      }

      // Check for Freighter wallet after a short delay (wait for library to load)
      setTimeout(async () => {
          console.log('🔍 Checking for Freighter API...');
          console.log('📦 window.freighterApi type:', typeof window.freighterApi);
          console.log('📦 window.freighterApi:', window.freighterApi ? Object.keys(window.freighterApi) : 'undefined');
          
          const isInstalled = await checkFreighterInstalled();
          if (isInstalled) {
              console.log('✅ Freighter wallet detected and ready');
              showToast('Freighter wallet detected! Click "Connect Wallet" to link your account.', 'success');
          } else {
              console.log('ℹ️ Freighter extension not detected. Make sure:');
              console.log('   1. Freighter extension is installed');
              console.log('   2. Extension is enabled in your browser');
              console.log('   3. Refresh the page after installing');
          }
      }, 1000);

      console.log('🌟 Stellar SDK loaded:', typeof StellarSdk !== 'undefined' ? '✓' : '✗');
  });
  