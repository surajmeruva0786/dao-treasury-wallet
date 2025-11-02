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
          
          setTimeout(() => {
              if (typeof window.loadProposals === 'function') {
                  console.log('🔄 Initializing proposals listener...');
                  window.loadProposals();
              }
          }, 500);
          
          testFirestoreConnection();
          
      } catch (error) {
          console.error('❌ Firebase initialization error:', error);
          showToast('Firebase Connection Failed', 'error');
          
          setTimeout(() => {
              if (typeof window.loadProposals === 'function') {
                  console.log('🔄 Attempting to load proposals despite error...');
                  window.loadProposals();
              }
          }, 500);
      }
  }
  
  async function testFirestoreConnection() {
      try {
          const { doc, setDoc, getDocs, collection, getDoc } = window.firebaseModules;
          
          try {
              const querySnapshot = await getDocs(collection(db, 'dao_config'));
              console.log(`✅ Firestore read access confirmed (${querySnapshot.size} documents)`);
              
              querySnapshot.forEach((doc) => {
                  console.log('📄 Document ID:', doc.id);
                  console.log('📋 Document data:', doc.data());
              });
              
              showToast('Connected to Firestore ✨', 'success');
              
              try {
                  const testDoc = doc(db, 'dao_config', 'treasury_info');
                  await setDoc(testDoc, {
                      dao_name: 'Community Treasury',
                      created_at: new Date().toISOString(),
                      status: 'active'
                  });
                  console.log('✅ Firestore write access confirmed');
              } catch (writeError) {
                  console.log('ℹ️ Firestore write not available (read-only mode)');
                  console.log('   This is normal for production deployments');
              }
              
          } catch (readError) {
              throw readError;
          }
          
      } catch (error) {
          console.error('❌ Firestore connection error:', error);
          console.log('');
          console.log('📋 TO FIX THIS ISSUE:');
          console.log('1. Open https://console.firebase.google.com');
          console.log('2. Select project: dao-treasury-wallet');
          console.log('3. Go to Firestore Database in left sidebar');
          console.log('4. Click CREATE DATABASE button');
          console.log('5. Select TEST MODE for development');
          console.log('6. Choose your region and click Enable');
          console.log('');
          
          showToast('Firestore: Create database in Firebase Console', 'warning');
      }
  }
  
  function showToast(message, type = 'success') {
      const toastContainer = document.getElementById('toast-container');
      
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      let icon = '✓';
      if (type === 'error') icon = '✗';
      if (type === 'warning') icon = '!';
      
      toast.innerHTML = `
          <div class="toast-icon">${icon}</div>
          <div class="toast-message">${message}</div>
      `;
      
      toastContainer.appendChild(toast);
      
      setTimeout(() => {
          toast.classList.add('toast-show');
      }, 10);
      
      setTimeout(() => {
          toast.classList.remove('toast-show');
          setTimeout(() => {
              toast.remove();
          }, 300);
      }, 3000);
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
                  
                  if (targetId === '#treasury') {
                      setTimeout(() => {
                          if (window.refreshTreasuryData && typeof window.refreshTreasuryData === 'function') {
                              window.refreshTreasuryData();
                          }
                      }, 300);
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

      const modal = document.getElementById('create-proposal-modal');
      const createProposalBtn = document.getElementById('create-proposal-btn');
      const modalClose = document.getElementById('modal-close');
      const modalCancel = document.getElementById('modal-cancel');
      const proposalForm = document.getElementById('proposal-form');
      const proposalsGrid = document.getElementById('proposals-grid');

      function openModal() {
          if (!userWalletAddress) {
              showToast('Please connect your wallet first', 'warning');
              return;
          }
          modal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
      }

      function closeModal() {
          modal.style.display = 'none';
          document.body.style.overflow = '';
          proposalForm.reset();
      }

      if (createProposalBtn) {
          createProposalBtn.addEventListener('click', openModal);
      }

      if (modalClose) {
          modalClose.addEventListener('click', closeModal);
      }

      if (modalCancel) {
          modalCancel.addEventListener('click', closeModal);
      }

      if (modal) {
          modal.addEventListener('click', (e) => {
              if (e.target.classList.contains('modal-overlay')) {
                  closeModal();
              }
          });
      }

      if (proposalForm) {
          proposalForm.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              if (!db) {
                  showToast('Firestore not initialized', 'error');
                  return;
              }

              if (!userWalletAddress) {
                  showToast('Please connect your wallet first', 'warning');
                  return;
              }

              const title = document.getElementById('proposal-title').value.trim();
              const description = document.getElementById('proposal-description').value.trim();
              const amount = parseFloat(document.getElementById('proposal-amount').value);
              const recipient = document.getElementById('proposal-recipient').value.trim();

              if (!title || !description || !amount || !recipient) {
                  showToast('Please fill all fields', 'warning');
                  return;
              }

              if (!recipient.startsWith('G') || recipient.length !== 56) {
                  showToast('Invalid Stellar address', 'error');
                  return;
              }

              try {
                  const { collection, addDoc, serverTimestamp } = window.firebaseModules;

                  const proposalData = {
                      title: title,
                      description: description,
                      amount: amount,
                      recipient: recipient,
                      creator: userWalletAddress,
                      votesFor: [],
                      votesAgainst: [],
                      status: 'active',
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp()
                  };

                  await addDoc(collection(db, 'proposals'), proposalData);
                  
                  showToast('Proposal created successfully! ✨', 'success');
                  closeModal();
                  
              } catch (error) {
                  console.error('Error creating proposal:', error);
                  showToast('Failed to create proposal: ' + error.message, 'error');
              }
          });
      }

      async function voteOnProposal(proposalId, voteType) {
          if (!db) {
              showToast('Firestore not initialized', 'error');
              return;
          }

          if (!userWalletAddress) {
              showToast('Please connect your wallet to vote', 'warning');
              return;
          }

          try {
              const { doc, updateDoc, arrayUnion, arrayRemove } = window.firebaseModules;
              const proposalRef = doc(db, 'proposals', proposalId);

              if (voteType === 'for') {
                  await updateDoc(proposalRef, {
                      votesFor: arrayUnion(userWalletAddress),
                      votesAgainst: arrayRemove(userWalletAddress)
                  });
                  showToast('Voted FOR! ✅', 'success');
              } else {
                  await updateDoc(proposalRef, {
                      votesAgainst: arrayUnion(userWalletAddress),
                      votesFor: arrayRemove(userWalletAddress)
                  });
                  showToast('Voted AGAINST! ❌', 'success');
              }
          } catch (error) {
              console.error('Error voting:', error);
              showToast('Failed to vote: ' + error.message, 'error');
          }
      }

      function renderProposal(proposal, proposalId) {
          const votesFor = proposal.votesFor || [];
          const votesAgainst = proposal.votesAgainst || [];
          const totalVotes = votesFor.length + votesAgainst.length;
          const forPercentage = totalVotes > 0 ? Math.round((votesFor.length / totalVotes) * 100) : 0;
          const againstPercentage = totalVotes > 0 ? Math.round((votesAgainst.length / totalVotes) * 100) : 0;

          const hasVotedFor = userWalletAddress && votesFor.includes(userWalletAddress);
          const hasVotedAgainst = userWalletAddress && votesAgainst.includes(userWalletAddress);
          const hasVoted = hasVotedFor || hasVotedAgainst;

          const shortRecipient = `${proposal.recipient.substring(0, 8)}...${proposal.recipient.substring(proposal.recipient.length - 6)}`;

          const proposalPassed = votesFor.length > votesAgainst.length;
          const isExecuted = proposal.status === 'executed';
          const canExecute = proposalPassed && !isExecuted && userWalletAddress;

          const card = document.createElement('div');
          card.className = `proposal-card ${isExecuted ? 'proposal-executed' : ''}`;
          card.style.opacity = '0';
          card.style.transform = 'translateY(30px)';
          card.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          
          card.innerHTML = `
              <div class="proposal-header">
                  <span class="proposal-status status-${isExecuted ? 'executed' : proposal.status}">${isExecuted ? 'executed' : proposal.status}</span>
                  <span class="proposal-id">#${proposalId.substring(0, 6)}</span>
              </div>
              <h3 class="proposal-title">${proposal.title}</h3>
              <p class="proposal-description">${proposal.description}</p>
              <div class="proposal-stats">
                  <div class="proposal-stat">
                      <span class="stat-label">For</span>
                      <span class="stat-value">${forPercentage}%</span>
                  </div>
                  <div class="proposal-stat">
                      <span class="stat-label">Against</span>
                      <span class="stat-value">${againstPercentage}%</span>
                  </div>
              </div>
              <div class="proposal-progress">
                  <div class="progress-bar" style="width: ${forPercentage}%"></div>
              </div>
              <div class="proposal-meta">
                  <div>
                      <div class="proposal-amount">${proposal.amount.toLocaleString()} XLM</div>
                      <div class="proposal-recipient" title="${proposal.recipient}">→ ${shortRecipient}</div>
                  </div>
              </div>
              <div class="vote-actions">
                  <button class="vote-btn vote-btn-for ${hasVotedFor ? 'voted' : ''}" 
                          data-proposal-id="${proposalId}" 
                          data-vote-type="for"
                          ${!userWalletAddress ? 'disabled' : ''}>
                      Vote For
                  </button>
                  <button class="vote-btn vote-btn-against ${hasVotedAgainst ? 'voted' : ''}" 
                          data-proposal-id="${proposalId}" 
                          data-vote-type="against"
                          ${!userWalletAddress ? 'disabled' : ''}>
                      Vote Against
                  </button>
              </div>
              ${canExecute ? `
                  <button class="btn btn-primary execute-payment-btn" 
                          data-proposal-id="${proposalId}">
                      <span class="btn-text">Execute Payment</span>
                      <span class="btn-glow"></span>
                  </button>
              ` : ''}
              ${isExecuted ? `
                  <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; text-align: center;">
                      <div style="color: #22c55e; font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem;">✓ Payment Executed</div>
                      ${proposal.transactionHash ? `
                          <div style="font-size: 0.85rem; color: var(--text-secondary); font-family: 'Courier New', monospace;">
                              Tx: ${proposal.transactionHash.substring(0, 12)}...
                          </div>
                      ` : ''}
                  </div>
              ` : ''}
          `;

          const voteButtons = card.querySelectorAll('.vote-btn');
          voteButtons.forEach(btn => {
              btn.addEventListener('click', () => {
                  const proposalId = btn.dataset.proposalId;
                  const voteType = btn.dataset.voteType;
                  voteOnProposal(proposalId, voteType);
              });
          });

          const executeBtn = card.querySelector('.execute-payment-btn');
          if (executeBtn) {
              executeBtn.addEventListener('click', async () => {
                  const proposalId = executeBtn.dataset.proposalId;
                  try {
                      executeBtn.disabled = true;
                      executeBtn.querySelector('.btn-text').textContent = 'Processing...';
                      await window.executePayment(proposalId, proposal);
                  } catch (error) {
                      console.error('Payment execution failed:', error);
                      executeBtn.disabled = false;
                      executeBtn.querySelector('.btn-text').textContent = '💸 Execute Payment';
                  }
              });
          }


          setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
          }, 100);

          const progressBar = card.querySelector('.progress-bar');
          if (progressBar) {
              const width = progressBar.style.width;
              progressBar.style.width = '0';
              setTimeout(() => {
                  progressBar.style.width = width;
              }, 200);
          }

          return card;
      }

      function loadProposals() {
          if (!db) {
              console.warn('⚠️ Firestore not initialized');
              if (proposalsGrid) {
                  proposalsGrid.innerHTML = `
                      <div class="empty-proposals">
                          <div class="empty-proposals-icon">📋</div>
                          <div class="empty-proposals-text">Firestore not initialized. Please check console for setup instructions.</div>
                      </div>
                  `;
              }
              return;
          }

          if (!proposalsGrid) {
              console.warn('⚠️ Proposals grid not found');
              return;
          }

          try {
              const { collection, onSnapshot } = window.firebaseModules;
              
              console.log('🔄 Setting up real-time proposals listener...');
              
              const proposalsCollection = collection(db, 'proposals');

              onSnapshot(proposalsCollection, (snapshot) => {
                  console.log(`📊 Proposals snapshot received: ${snapshot.size} documents`);
                  proposalsGrid.innerHTML = '';
                  
                  if (snapshot.empty) {
                      proposalsGrid.innerHTML = `
                          <div class="empty-proposals">
                              <div class="empty-proposals-icon">📋</div>
                              <div class="empty-proposals-text">No proposals yet. Be the first to create one!</div>
                          </div>
                      `;
                      return;
                  }

                  const proposalsArray = [];
                  snapshot.forEach((doc) => {
                      const proposal = doc.data();
                      proposalsArray.push({ id: doc.id, data: proposal, timestamp: proposal.createdAt });
                  });

                  proposalsArray.sort((a, b) => {
                      if (!a.timestamp || !b.timestamp) return 0;
                      const aTime = a.timestamp.seconds || 0;
                      const bTime = b.timestamp.seconds || 0;
                      return bTime - aTime;
                  });

                  proposalsArray.forEach((item) => {
                      const proposalCard = renderProposal(item.data, item.id);
                      proposalsGrid.appendChild(proposalCard);
                  });

                  console.log(`✅ Loaded ${snapshot.size} proposals with real-time sync`);
              }, (error) => {
                  console.error('❌ Error in proposals listener:', error);
                  console.error('Error code:', error.code);
                  console.error('Error message:', error.message);
                  
                  proposalsGrid.innerHTML = `
                      <div class="empty-proposals">
                          <div class="empty-proposals-icon">⚠️</div>
                          <div class="empty-proposals-text">Error loading proposals. Check console for details.</div>
                      </div>
                  `;
              });
              
          } catch (error) {
              console.error('❌ Error setting up proposals listener:', error);
              proposalsGrid.innerHTML = `
                  <div class="empty-proposals">
                      <div class="empty-proposals-icon">⚠️</div>
                      <div class="empty-proposals-text">Error loading proposals: ${error.message}</div>
                  </div>
              `;
          }
      }

      window.loadProposals = loadProposals;

      const USE_TESTNET = true;
      const HORIZON_URL = USE_TESTNET 
          ? 'https://horizon-testnet.stellar.org'
          : 'https://horizon.stellar.org';
      
      let treasuryWalletAddress = null;

      function saveTreasuryWallet(address) {
          localStorage.setItem('treasuryWalletAddress', address);
          treasuryWalletAddress = address;
      }

      function loadTreasuryWallet() {
          const saved = localStorage.getItem('treasuryWalletAddress');
          if (saved) {
              treasuryWalletAddress = saved;
              return saved;
          }
          return null;
      }

      async function fetchTreasuryBalance(walletAddress) {
          if (!walletAddress || !walletAddress.startsWith('G') || walletAddress.length !== 56) {
              throw new Error('Invalid Stellar address format');
          }

          console.log(`🔍 Fetching balance for address: ${walletAddress}`);
          console.log(`🌐 Using Horizon URL: ${HORIZON_URL}`);
          console.log(`📡 Network: ${USE_TESTNET ? 'TESTNET' : 'MAINNET'}`);

          let retries = 3;
          while (retries > 0) {
              try {
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 10000);
                  
                  const url = `${HORIZON_URL}/accounts/${walletAddress}`;
                  console.log(`📡 Fetching: ${url}`);
                  
                  const response = await fetch(url, {
                      signal: controller.signal
                  });
                  
                  clearTimeout(timeoutId);
                  
                  console.log(`📊 Response status: ${response.status} ${response.statusText}`);
                  
                  if (!response.ok) {
                      if (response.status === 404) {
                          // Account not found - check if it might be on the wrong network
                          console.log('ℹ️ Account not found on current network');
                          console.log(`   Address: ${walletAddress}`);
                          console.log(`   Network: ${USE_TESTNET ? 'TESTNET' : 'MAINNET'}`);
                          console.log(`   ⚠️  If you have funds, make sure you're on the correct network!`);
                          
                          // Try to provide helpful error message
                          const errorText = await response.text().catch(() => '');
                          console.log('   Response:', errorText);
                          
                          return {
                              balance: 0,
                              accountData: null,
                              accountNotFound: true,
                              errorMessage: `Account not found on ${USE_TESTNET ? 'TESTNET' : 'MAINNET'}. Make sure you're checking the correct network.`
                          };
                      }
                      // For other errors, retry
                      if (retries > 1) {
                          throw new Error(`Failed to fetch account data: ${response.status} ${response.statusText}`);
                      } else {
                          throw new Error(`Failed to fetch account data: ${response.status} ${response.statusText}`);
                      }
                  }
                  
                  const accountData = await response.json();
                  
                  console.log('✅ Account found! Account ID:', accountData.id);
                  
                  const xlmBalance = accountData.balances.find(b => b.asset_type === 'native');
                  const balance = xlmBalance ? parseFloat(xlmBalance.balance) : 0;
                  
                  console.log(`💰 XLM Balance: ${balance} XLM`);
                  console.log(`📊 Total balances:`, accountData.balances.length);
                  
                  return {
                      balance: balance,
                      accountData: accountData,
                      accountNotFound: false
                  };
              } catch (error) {
                  // Don't retry on 404 or abort errors
                  if (error.message && error.message.includes('404')) {
                      return {
                          balance: 0,
                          accountData: null,
                          accountNotFound: true
                      };
                  }
                  if (error.name === 'AbortError') {
                      throw new Error('Request timeout. Please check your connection and try again.');
                  }
                  
                  retries--;
                  if (retries === 0) {
                      console.error('Error fetching treasury balance after retries:', error);
                      throw error;
                  }
                  console.warn(`Retrying treasury balance fetch... ${retries} attempts left`);
                  await new Promise(resolve => setTimeout(resolve, 1000));
              }
          }
      }

      async function fetchRecentTransactions(walletAddress, limit = 5) {
          if (!walletAddress || !walletAddress.startsWith('G') || walletAddress.length !== 56) {
              throw new Error('Invalid Stellar address format');
          }

          let retries = 3;
          while (retries > 0) {
              try {
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 10000);
                  
                  const response = await fetch(
                      `${HORIZON_URL}/accounts/${walletAddress}/transactions?order=desc&limit=${limit}`,
                      { signal: controller.signal }
                  );
                  
                  clearTimeout(timeoutId);
                  
                  if (!response.ok) {
                      if (response.status === 404) {
                          // Account not found - return empty array, don't retry
                          return [];
                      }
                      if (retries === 1) {
                          throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
                      }
                      throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
                  }
                  
                  const data = await response.json();
                  return data._embedded?.records || [];
              } catch (error) {
                  if (error.name === 'AbortError') {
                      throw new Error('Request timeout. Please check your connection and try again.');
                  }
                  
                  retries--;
                  if (retries === 0) {
                      console.error('Error fetching transactions after retries:', error);
                      throw error;
                  }
                  console.warn(`Retrying transactions fetch... ${retries} attempts left`);
                  await new Promise(resolve => setTimeout(resolve, 1000));
              }
          }
      }

          function displayBalance(balance, accountNotFound = false) {
              const balanceElement = document.getElementById('xlm-balance');
              const balanceUsdElement = document.getElementById('xlm-balance-usd');
              
              if (accountNotFound) {
                  balanceElement.innerHTML = '<span style="color: #fbbf24; font-size: 0.9rem;">Account not funded yet</span>';
                  balanceUsdElement.innerHTML = '<span style="color: #9ca3af; font-size: 0.85rem;">Fund this address to activate</span>';
                  return;
              }
              
              balanceElement.textContent = `${balance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 7
              })} XLM`;
              
              const xlmPriceUsd = 0.12;
              const usdValue = balance * xlmPriceUsd;
              balanceUsdElement.textContent = `≈ $${usdValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
              })} USD`;
          }

      function displayTransactions(transactions) {
          const container = document.getElementById('transactions-container');
          
          if (!transactions || transactions.length === 0) {
              container.innerHTML = `
                  <div class="empty-transactions">
                      <div class="empty-transactions-icon">📭</div>
                      <p>No transactions yet</p>
                  </div>
              `;
              return;
          }

          const totalTxElement = document.getElementById('total-transactions');
          if (totalTxElement) {
              totalTxElement.textContent = transactions.length;
          }

          const lastTxAmount = document.getElementById('last-transaction-amount');
          const lastTxTime = document.getElementById('last-transaction-time');
          if (transactions.length > 0 && lastTxAmount && lastTxTime) {
              lastTxAmount.textContent = 'Recent';
              const txDate = new Date(transactions[0].created_at);
              lastTxTime.textContent = formatTimeAgo(txDate);
          }

          container.innerHTML = transactions.map(tx => {
              const txDate = new Date(tx.created_at);
              const txType = tx.type || 'payment';
              const explorerUrl = USE_TESTNET
                  ? `https://testnet.stellarchain.io/transactions/${tx.hash}`
                  : `https://stellarchain.io/transactions/${tx.hash}`;
              
              return `
                  <div class="transaction-row">
                      <div class="transaction-type transaction-type-${txType.toLowerCase()}">
                          ${txType}
                      </div>
                      <div class="transaction-hash" title="${tx.hash}">
                          ${tx.hash.substring(0, 16)}...${tx.hash.substring(tx.hash.length - 8)}
                      </div>
                      <div class="transaction-amount">
                          Op: ${tx.operation_count}
                      </div>
                      <div class="transaction-time">
                          ${formatTimeAgo(txDate)}
                      </div>
                      <div class="transaction-link">
                          <a href="${explorerUrl}" target="_blank" title="View on Explorer">🔗</a>
                      </div>
                  </div>
              `;
          }).join('');
      }

      function formatTimeAgo(date) {
          const seconds = Math.floor((new Date() - date) / 1000);
          
          if (seconds < 60) return `${seconds}s ago`;
          if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
          if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
          if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
          return date.toLocaleDateString();
      }

          async function refreshTreasuryData() {
              if (!treasuryWalletAddress) {
                  console.log('ℹ️ No treasury wallet set');
                  const balanceElement = document.getElementById('xlm-balance');
                  if (balanceElement) {
                      balanceElement.innerHTML = '<span style="color: #9ca3af;">Set treasury wallet address first</span>';
                  }
                  return;
              }

              console.log(`💰 Refreshing treasury data for: ${treasuryWalletAddress}`);

              try {
                  const refreshBtn = document.getElementById('refresh-balance-btn');
                  if (refreshBtn) {
                      refreshBtn.style.animation = 'none';
                      setTimeout(() => {
                          refreshBtn.style.animation = '';
                      }, 10);
                  }

                  const result = await fetchTreasuryBalance(treasuryWalletAddress);
                  
                  console.log('📊 Balance fetch result:', result);
                  
                  displayBalance(result.balance, result.accountNotFound);
                  
                  if (result.errorMessage) {
                      console.warn('⚠️', result.errorMessage);
                  }

                  // Only fetch transactions if account exists
                  let transactionCount = 0;
                  if (!result.accountNotFound) {
                      try {
                          const transactions = await fetchRecentTransactions(treasuryWalletAddress);
                          displayTransactions(transactions);
                          transactionCount = transactions.length;
                          
                          // Save balance data to Firestore
                          if (db) {
                              try {
                                  const { doc, setDoc, serverTimestamp } = window.firebaseModules;
                                  const treasuryDataRef = doc(db, 'treasury_data', 'balance_info');
                                  await setDoc(treasuryDataRef, {
                                      walletAddress: treasuryWalletAddress,
                                      balance: result.balance,
                                      transactionCount: transactionCount,
                                      lastUpdated: serverTimestamp(),
                                      network: USE_TESTNET ? 'TESTNET' : 'MAINNET',
                                      accountExists: true
                                  });
                                  console.log('✅ Treasury balance saved to Firestore');
                              } catch (firestoreError) {
                                  console.warn('⚠️ Could not save to Firestore:', firestoreError);
                              }
                          }
                      } catch (txError) {
                          console.warn('Could not fetch transactions:', txError);
                          // Don't show error, just log it
                      }
                  } else {
                      // Show empty state for unfunded account
                      const container = document.getElementById('transactions-container');
                      if (container) {
                          container.innerHTML = `
                              <div class="empty-transactions">
                                  <div class="empty-transactions-icon">💡</div>
                                  <p>Account needs to be funded first</p>
                                  ${result.errorMessage ? `<p style="margin-top: 0.5rem; color: #fbbf24; font-size: 0.9rem;">${result.errorMessage}</p>` : ''}
                              </div>
                          `;
                      }
                      
                      let toastMessage = 'Account not found on ' + (USE_TESTNET ? 'TESTNET' : 'MAINNET');
                      if (result.errorMessage) {
                          toastMessage += '. Make sure you\'re checking the correct network.';
                      } else {
                          toastMessage += '. Please fund this address first.';
                      }
                      showToast(toastMessage, 'warning');
                      return; // Don't show success toast
                  }

                  const networkElement = document.getElementById('stellar-network');
                  if (networkElement) {
                      networkElement.textContent = USE_TESTNET ? 'Testnet' : 'Mainnet';
                  }

                  showToast('Treasury data refreshed', 'success');
              } catch (error) {
                  console.error('Error refreshing treasury data:', error);
                  
                  // More specific error messages
                  let errorMessage = 'Failed to refresh treasury data';
                  if (error.message && error.message.includes('timeout')) {
                      errorMessage = 'Request timeout. Please try again.';
                  } else if (error.message && error.message.includes('network')) {
                      errorMessage = 'Network error. Please check your connection.';
                  }
                  
                  showToast(errorMessage, 'error');
                  
                  const balanceElement = document.getElementById('xlm-balance');
                  if (balanceElement) {
                      balanceElement.innerHTML = '<span style="color: #ef4444;">Error loading</span>';
                  }
              }
          }

      const setWalletBtn = document.getElementById('set-treasury-wallet-btn');
      if (setWalletBtn) {
          setWalletBtn.addEventListener('click', async () => {
              const input = document.getElementById('treasury-wallet-input');
              const address = input.value.trim();
              
              if (!address) {
                  showToast('Please enter a wallet address', 'warning');
                  return;
              }

              if (!address.startsWith('G') || address.length !== 56) {
                  showToast('Invalid Stellar address format', 'error');
                  return;
              }

              saveTreasuryWallet(address);
              
              const inputContainer = input.parentElement;
              const savedContainer = document.getElementById('treasury-wallet-saved');
              const savedAddress = savedContainer.querySelector('.wallet-saved-address');
              
              const shortAddr = `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
              savedAddress.textContent = shortAddr;
              savedAddress.title = address;
              
              inputContainer.style.display = 'none';
              setWalletBtn.style.display = 'none';
              savedContainer.style.display = 'flex';
              
              showToast('Treasury wallet set successfully', 'success');
              
              await refreshTreasuryData();
          });
      }

      const changeWalletBtn = document.getElementById('change-treasury-wallet-btn');
      if (changeWalletBtn) {
          changeWalletBtn.addEventListener('click', () => {
              const input = document.getElementById('treasury-wallet-input');
              const setBtn = document.getElementById('set-treasury-wallet-btn');
              const savedContainer = document.getElementById('treasury-wallet-saved');
              
              input.parentElement.style.display = 'flex';
              setBtn.style.display = 'inline-block';
              savedContainer.style.display = 'none';
              
              input.value = treasuryWalletAddress || '';
              input.focus();
          });
      }

      const refreshBalanceBtn = document.getElementById('refresh-balance-btn');
      if (refreshBalanceBtn) {
          refreshBalanceBtn.addEventListener('click', refreshTreasuryData);
      }
      
      window.refreshTreasuryData = refreshTreasuryData;

      const savedWallet = loadTreasuryWallet();
      if (savedWallet) {
          const input = document.getElementById('treasury-wallet-input');
          const setBtn = document.getElementById('set-treasury-wallet-btn');
          const savedContainer = document.getElementById('treasury-wallet-saved');
          const savedAddress = savedContainer.querySelector('.wallet-saved-address');
          
          const shortAddr = `${savedWallet.substring(0, 8)}...${savedWallet.substring(savedWallet.length - 6)}`;
          savedAddress.textContent = shortAddr;
          savedAddress.title = savedWallet;
          
          if (input && setBtn && savedContainer) {
              input.parentElement.style.display = 'none';
              setBtn.style.display = 'none';
              savedContainer.style.display = 'flex';
          }
          
          setTimeout(() => {
              refreshTreasuryData();
          }, 1000);
      }

      async function executePayment(proposalId, proposalData) {
          try {
              if (!userWalletAddress) {
                  showToast('Please connect your wallet first', 'warning');
                  return;
              }

              if (!treasuryWalletAddress) {
                  showToast('Treasury wallet not configured', 'error');
                  return;
              }

              if (!window.freighterApi) {
                  showToast('Freighter wallet not available', 'error');
                  return;
              }

              if (!db) {
                  showToast('Database not initialized', 'error');
                  return;
              }

              showToast('Verifying proposal status...', 'success');

              const { doc, getDoc, updateDoc } = window.firebaseModules;
              const proposalRef = doc(db, 'proposals', proposalId);
              const proposalSnap = await getDoc(proposalRef);

              if (!proposalSnap.exists()) {
                  showToast('Proposal not found', 'error');
                  return;
              }

              const currentProposal = proposalSnap.data();
              
              if (currentProposal.status === 'executed') {
                  showToast('Proposal already executed', 'warning');
                  return;
              }

              const votesFor = currentProposal.votesFor || [];
              const votesAgainst = currentProposal.votesAgainst || [];

              if (votesFor.length <= votesAgainst.length) {
                  showToast('Proposal has not passed (insufficient votes)', 'error');
                  return;
              }

              await updateDoc(proposalRef, {
                  status: 'executing',
                  executionStartedAt: new Date().toISOString(),
                  executionStartedBy: userWalletAddress
              });

              showToast('Preparing payment transaction...', 'success');

              const server = new StellarSdk.Horizon.Server(HORIZON_URL);
              const sourceAccount = await server.loadAccount(userWalletAddress);

              const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
                  fee: StellarSdk.BASE_FEE,
                  networkPassphrase: USE_TESTNET 
                      ? StellarSdk.Networks.TESTNET 
                      : StellarSdk.Networks.PUBLIC
              })
              .addOperation(StellarSdk.Operation.payment({
                  destination: currentProposal.recipient,
                  asset: StellarSdk.Asset.native(),
                  amount: currentProposal.amount.toString()
              }))
              .addMemo(StellarSdk.Memo.text(`DAO Proposal #${proposalId.substring(0, 8)}`))
              .setTimeout(180)
              .build();

              const xdr = transaction.toXDR();

              showToast('Please sign the transaction in Freighter...', 'success');

              const signedXdr = await window.freighterApi.signTransaction(xdr, {
                  networkPassphrase: USE_TESTNET 
                      ? StellarSdk.Networks.TESTNET 
                      : StellarSdk.Networks.PUBLIC
              });

              const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
                  signedXdr,
                  HORIZON_URL
              );

              showToast('Submitting transaction to Stellar network...', 'success');

              const result = await server.submitTransaction(signedTransaction);

              console.log('✅ Payment executed successfully!', result);

              await updateDoc(proposalRef, {
                  status: 'executed',
                  executedAt: new Date().toISOString(),
                  transactionHash: result.hash,
                  executedBy: userWalletAddress
              });

              showToast(`Payment executed successfully! 🎉`, 'success');
              
              setTimeout(() => {
                  refreshTreasuryData();
              }, 2000);

              return result;
          } catch (error) {
              console.error('❌ Payment execution error:', error);
              
              if (db) {
                  try {
                      const { doc, updateDoc } = window.firebaseModules;
                      const proposalRef = doc(db, 'proposals', proposalId);
                      await updateDoc(proposalRef, {
                          status: 'active',
                          executionError: error.message,
                          executionFailedAt: new Date().toISOString()
                      });
                  } catch (rollbackError) {
                      console.error('Failed to rollback proposal status:', rollbackError);
                  }
              }
              
              let errorMessage = 'Failed to execute payment';
              
              if (error.message) {
                  if (error.message.includes('User declined')) {
                      errorMessage = 'Transaction was declined';
                  } else if (error.message.includes('insufficient')) {
                      errorMessage = 'Insufficient balance';
                  } else {
                      errorMessage = error.message;
                  }
              }
              
              showToast(errorMessage, 'error');
              throw error;
          }
      }

      window.executePayment = executePayment;

      let isAdminLoggedIn = false;

      function checkAdminLogin() {
          const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
          if (adminLoggedIn === 'true') {
              isAdminLoggedIn = true;
              showAdminDashboard();
          }
      }

      function showAdminDashboard() {
          const loginView = document.getElementById('admin-login-view');
          const dashboardView = document.getElementById('admin-dashboard-view');
          
          if (loginView && dashboardView) {
              loginView.style.display = 'none';
              dashboardView.style.display = 'block';
          }
          
          const savedWallet = loadTreasuryWallet();
          if (savedWallet) {
              const input = document.getElementById('admin-treasury-wallet-input');
              const setBtn = document.getElementById('admin-set-treasury-wallet-btn');
              const savedContainer = document.getElementById('admin-treasury-wallet-saved');
              const savedAddress = savedContainer.querySelector('.wallet-saved-address');
              
              const shortAddr = `${savedWallet.substring(0, 8)}...${savedWallet.substring(savedWallet.length - 6)}`;
              savedAddress.textContent = shortAddr;
              savedAddress.title = savedWallet;
              
              if (input && setBtn && savedContainer) {
                  input.parentElement.style.display = 'none';
                  setBtn.style.display = 'none';
                  savedContainer.style.display = 'flex';
              }
          }
          
          loadAdminProposals();
      }

      function showAdminLogin() {
          const loginView = document.getElementById('admin-login-view');
          const dashboardView = document.getElementById('admin-dashboard-view');
          
          if (loginView && dashboardView) {
              loginView.style.display = 'block';
              dashboardView.style.display = 'none';
          }
      }

      const adminLoginForm = document.getElementById('admin-login-form');
      if (adminLoginForm) {
          adminLoginForm.addEventListener('submit', (e) => {
              e.preventDefault();
              
              const username = document.getElementById('admin-username').value.trim();
              const password = document.getElementById('admin-password').value;
              
              if (username === 'treasury_admin' && password === 'treasury_pass') {
                  isAdminLoggedIn = true;
                  sessionStorage.setItem('adminLoggedIn', 'true');
                  showToast('Admin login successful! ✨', 'success');
                  showAdminDashboard();
                  
                  document.getElementById('admin-username').value = '';
                  document.getElementById('admin-password').value = '';
              } else {
                  showToast('Invalid credentials', 'error');
              }
          });
      }

      const adminLogoutBtn = document.getElementById('admin-logout-btn');
      if (adminLogoutBtn) {
          adminLogoutBtn.addEventListener('click', () => {
              isAdminLoggedIn = false;
              sessionStorage.removeItem('adminLoggedIn');
              showToast('Logged out successfully', 'success');
              showAdminLogin();
              
              const sections = document.querySelectorAll('section[id]');
              sections.forEach(s => s.style.display = 'none');
              document.getElementById('home').style.display = 'block';
              
              const navLinks = document.querySelectorAll('.nav-link');
              navLinks.forEach(l => l.classList.remove('active'));
              document.querySelector('.nav-link[href="#home"]').classList.add('active');
          });
      }

      const adminSection = document.getElementById('admin');
      const adminLink = document.querySelector('.nav-link[href="#admin"]');
      
      if (adminLink) {
          const originalNavClickHandler = adminLink.onclick;
          adminLink.addEventListener('click', (e) => {
              e.preventDefault();
              
              const sections = document.querySelectorAll('section[id]');
              sections.forEach(s => s.style.display = 'none');
              
              if (adminSection) {
                  adminSection.style.display = 'block';
              }
              
              const navLinks = document.querySelectorAll('.nav-link');
              navLinks.forEach(l => l.classList.remove('active'));
              adminLink.classList.add('active');
              
              window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
              });
              
              checkAdminLogin();
          });
      }

      const adminSetWalletBtn = document.getElementById('admin-set-treasury-wallet-btn');
      if (adminSetWalletBtn) {
          adminSetWalletBtn.addEventListener('click', async () => {
              const input = document.getElementById('admin-treasury-wallet-input');
              const address = input.value.trim();
              
              if (!address) {
                  showToast('Please enter a wallet address', 'warning');
                  return;
              }

              if (!address.startsWith('G') || address.length !== 56) {
                  showToast('Invalid Stellar address format', 'error');
                  return;
              }

              saveTreasuryWallet(address);
              
              const inputContainer = input.parentElement;
              const savedContainer = document.getElementById('admin-treasury-wallet-saved');
              const savedAddress = savedContainer.querySelector('.wallet-saved-address');
              
              const shortAddr = `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
              savedAddress.textContent = shortAddr;
              savedAddress.title = address;
              
              inputContainer.style.display = 'none';
              adminSetWalletBtn.style.display = 'none';
              savedContainer.style.display = 'flex';
              
              showToast('Treasury wallet set successfully', 'success');
              
              await refreshTreasuryData();
          });
      }

      const adminChangeWalletBtn = document.getElementById('admin-change-treasury-wallet-btn');
      if (adminChangeWalletBtn) {
          adminChangeWalletBtn.addEventListener('click', () => {
              const input = document.getElementById('admin-treasury-wallet-input');
              const setBtn = document.getElementById('admin-set-treasury-wallet-btn');
              const savedContainer = document.getElementById('admin-treasury-wallet-saved');
              
              input.parentElement.style.display = 'flex';
              setBtn.style.display = 'inline-block';
              savedContainer.style.display = 'none';
              
              input.value = treasuryWalletAddress || '';
              input.focus();
          });
      }

      function renderAdminProposal(proposal, proposalId) {
          const votesFor = proposal.votesFor ? proposal.votesFor.length : 0;
          const votesAgainst = proposal.votesAgainst ? proposal.votesAgainst.length : 0;
          const totalVotes = votesFor + votesAgainst;
          const votesForPercent = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
          
          const isApproved = votesFor > votesAgainst;
          const isExecuted = proposal.status === 'executed';
          
          const card = document.createElement('div');
          card.className = `proposal-card ${isExecuted ? 'proposal-executed' : ''}`;
          
          let actionButton = '';
          if (isExecuted) {
              actionButton = `
                  <div class="proposal-approved-badge">
                      ✓ Payment Executed
                  </div>
                  ${proposal.transactionHash ? `
                      <a href="${USE_TESTNET ? 'https://testnet.stellarchain.io' : 'https://stellarchain.io'}/transactions/${proposal.transactionHash}" 
                         target="_blank" 
                         class="btn btn-secondary" 
                         style="margin-top: 1rem; width: 100%; text-decoration: none;">
                          <span class="btn-text">View Transaction</span>
                      </a>
                  ` : ''}
              `;
          } else if (isApproved) {
              actionButton = `
                  <div class="proposal-approved-badge">
                      ✓ Approved (${votesFor} for, ${votesAgainst} against)
                  </div>
                  <button class="btn btn-primary admin-action-btn" data-proposal-id="${proposalId}">
                      <span class="btn-text">💸 Process Payment</span>
                      <span class="btn-glow"></span>
                  </button>
              `;
          } else {
              actionButton = `
                  <div class="proposal-rejected-badge">
                      ✗ Not Approved (${votesFor} for, ${votesAgainst} against)
                  </div>
              `;
          }
          
          card.innerHTML = `
              <div class="proposal-header">
                  <span class="proposal-status ${isExecuted ? 'status-executed' : 'status-active'}">${isExecuted ? 'Executed' : 'Active'}</span>
                  <span class="proposal-id">#${proposalId.substring(0, 8)}</span>
              </div>
              <h3 class="proposal-title">${proposal.title || 'Untitled Proposal'}</h3>
              <p class="proposal-description">${proposal.description || 'No description provided'}</p>
              <div class="proposal-stats">
                  <div class="proposal-stat">
                      <span class="stat-label">For</span>
                      <span class="stat-value">${votesFor}</span>
                  </div>
                  <div class="proposal-stat">
                      <span class="stat-label">Against</span>
                      <span class="stat-value">${votesAgainst}</span>
                  </div>
              </div>
              <div class="proposal-progress">
                  <div class="progress-bar" style="width: ${votesForPercent}%"></div>
              </div>
              <div class="proposal-meta">
                  <span class="proposal-amount">${proposal.amount || 0} XLM</span>
                  <span class="proposal-recipient" title="${proposal.recipient || ''}">${proposal.recipient ? proposal.recipient.substring(0, 8) + '...' + proposal.recipient.substring(proposal.recipient.length - 6) : 'N/A'}</span>
              </div>
              ${actionButton}
          `;
          
          const actionBtn = card.querySelector('.admin-action-btn');
          if (actionBtn) {
              actionBtn.addEventListener('click', async () => {
                  if (!userWalletAddress) {
                      showToast('Please connect your Freighter wallet first', 'warning');
                      return;
                  }
                  
                  try {
                      actionBtn.disabled = true;
                      actionBtn.querySelector('.btn-text').textContent = 'Processing...';
                      await window.executePayment(proposalId, proposal);
                      loadAdminProposals();
                  } catch (error) {
                      console.error('Payment execution failed:', error);
                      actionBtn.disabled = false;
                      actionBtn.querySelector('.btn-text').textContent = '💸 Process Payment';
                  }
              });
          }
          
          return card;
      }

      async function loadAdminProposals() {
          const adminProposalsGrid = document.getElementById('admin-proposals-grid');
          
          if (!adminProposalsGrid) {
              return;
          }
          
          if (!db) {
              adminProposalsGrid.innerHTML = `
                  <div class="empty-proposals">
                      <div class="empty-proposals-icon">⚠️</div>
                      <div class="empty-proposals-text">Database not initialized</div>
                  </div>
              `;
              return;
          }
          
          try {
              const { collection, onSnapshot } = window.firebaseModules;
              const proposalsCollection = collection(db, 'proposals');
              
              onSnapshot(proposalsCollection, (snapshot) => {
                  adminProposalsGrid.innerHTML = '';
                  
                  if (snapshot.empty) {
                      adminProposalsGrid.innerHTML = `
                          <div class="empty-proposals">
                              <div class="empty-proposals-icon">📋</div>
                              <div class="empty-proposals-text">No proposals to display</div>
                          </div>
                      `;
                      return;
                  }
                  
                  const proposalsArray = [];
                  snapshot.forEach((doc) => {
                      const proposal = doc.data();
                      proposalsArray.push({ id: doc.id, data: proposal, timestamp: proposal.createdAt });
                  });
                  
                  proposalsArray.sort((a, b) => {
                      if (!a.timestamp || !b.timestamp) return 0;
                      const aTime = a.timestamp.seconds || 0;
                      const bTime = b.timestamp.seconds || 0;
                      return bTime - aTime;
                  });
                  
                  proposalsArray.forEach((item) => {
                      const proposalCard = renderAdminProposal(item.data, item.id);
                      adminProposalsGrid.appendChild(proposalCard);
                  });
              });
          } catch (error) {
              console.error('Error loading admin proposals:', error);
              adminProposalsGrid.innerHTML = `
                  <div class="empty-proposals">
                      <div class="empty-proposals-icon">⚠️</div>
                      <div class="empty-proposals-text">Error loading proposals</div>
                  </div>
              `;
          }
      }

      checkAdminLogin();

  });
  