// Global variables
let particleCanvas, particleCtx;
let particles = [];
let mouse = { x: 0, y: 0 };
let currentSection = 'hero';
let isTransitioning = false;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
function initializeApp() {
    setupLoadingSequence();
    setupCustomCursor();
    setupParticleSystem();
    setupNavigation();
    setupFormHandlers();
    setupInteractiveElements();
    setupScrollAnimations();
    setupSoundEffects();
    
    // Start the loading sequence
    startLoadingSequence();
    // Reset target section position and show it
targetSectionEl.style.transform = 'translateX(0)';
targetSectionEl.style.opacity = '1';
}

// Loading Sequence
function setupLoadingSequence() {
    const loadingScreen = document.getElementById('loadingScreen');
    const terminalIntro = document.getElementById('terminalIntro');
    
    // Prevent scrolling during loading
    document.body.style.overflow = 'hidden';
}

function startLoadingSequence() {
    // Phase 1: Loading bar animation (3 seconds)
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            startTerminalSequence();
        }, 1000);
    }, 3500);
}

function startTerminalSequence() {
    const terminalIntro = document.getElementById('terminalIntro');
    const terminalLines = document.querySelectorAll('.terminal-line');
    
    terminalIntro.style.opacity = '1';
    terminalIntro.style.pointerEvents = 'auto';
    
    // Animate terminal lines
    terminalLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
            
            // Type out the content if it has the prompt class
            if (line.querySelector('.prompt')) {
                typeText(line.querySelector('.prompt'), line.querySelector('.prompt').textContent);
            }
        }, index * 800);
    });
    
    // Wait for user interaction or auto-proceed after 8 seconds
    setTimeout(() => {
        terminalIntro.style.opacity = '0';
        setTimeout(() => {
            terminalIntro.style.display = 'none';
            document.body.style.overflow = 'auto';
            startMainExperience();
        }, 1000);
    }, 8000);
    
    // Allow manual skip
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            terminalIntro.style.opacity = '0';
            setTimeout(() => {
                terminalIntro.style.display = 'none';
                document.body.style.overflow = 'auto';
                startMainExperience();
            }, 500);
        }
    });
    
    terminalIntro.addEventListener('click', function() {
        terminalIntro.style.opacity = '0';
        setTimeout(() => {
            terminalIntro.style.display = 'none';
            document.body.style.overflow = 'auto';
            startMainExperience();
        }, 500);
    });
}

function startMainExperience() {
    // Start hero animations
    animateHeroElements();
    startStatCounters();
    startTypingAnimation();
    
    // Initialize skill levels
    setTimeout(() => {
        animateSkillLevels();
    }, 1000);
}

// Custom Cursor
function setupCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const interactiveElements = document.querySelectorAll('a, button, .nav-orb, .project-card, .skill-node, .achievement');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}

// Particle System
function setupParticleSystem() {
    particleCanvas = document.getElementById('particleCanvas');
    particleCtx = particleCanvas.getContext('2d');
    
    resizeCanvas();
    createParticles();
    animateParticles();
    
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

function createParticles() {
    const particleCount = Math.min(150, window.innerWidth / 10);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * particleCanvas.width,
            y: Math.random() * particleCanvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            hue: Math.random() * 60 + 180 // Blue to cyan range
        });
    }
}

function animateParticles() {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Mouse interaction
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx += dx * force * 0.001;
            particle.vy += dy * force * 0.001;
        }
        
        // Boundary check
        if (particle.x < 0 || particle.x > particleCanvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > particleCanvas.height) particle.vy *= -1;
        
        // Draw particle
        particleCtx.beginPath();
        particleCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        particleCtx.fillStyle = `hsla(${particle.hue}, 100%, 50%, ${particle.opacity})`;
        particleCtx.fill();
        
        // Draw connections
        particles.slice(index + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                particleCtx.beginPath();
                particleCtx.moveTo(particle.x, particle.y);
                particleCtx.lineTo(otherParticle.x, otherParticle.y);
                particleCtx.strokeStyle = `hsla(${particle.hue}, 100%, 50%, ${0.1 * (1 - distance / 100)})`;
                particleCtx.stroke();
            }
        });
    });
    
    requestAnimationFrame(animateParticles);
}

// Navigation System
function setupNavigation() {
    const navOrbs = document.querySelectorAll('.nav-orb');
    const sections = document.querySelectorAll('.section');
    
    navOrbs.forEach(orb => {
        orb.addEventListener('click', () => {
            if (isTransitioning) return;
            
            const targetSection = orb.dataset.section;
            if (targetSection === currentSection) return;
            
            switchSection(targetSection);
            playClickSound();
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isTransitioning) return;
        
        const sectionOrder = ['hero', 'about', 'skills', 'journey', 'projects', 'contact'];
        const currentIndex = sectionOrder.indexOf(currentSection);
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % sectionOrder.length;
            switchSection(sectionOrder[nextIndex]);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + sectionOrder.length) % sectionOrder.length;
            switchSection(sectionOrder[prevIndex]);
        }
    });
}

// Replace the existing switchSection function with this one:
function switchSection(targetSection) {
    if (isTransitioning || targetSection === currentSection) return;
    
    isTransitioning = true;
    
    // Update nav orbs
    document.querySelectorAll('.nav-orb').forEach(orb => {
        orb.classList.remove('active');
        if (orb.dataset.section === targetSection) {
            orb.classList.add('active');
        }
    });
    
    // Get current and target sections
    const currentSectionEl = document.getElementById(currentSection);
    const targetSectionEl = document.getElementById(targetSection);
    
    // Hide current section
    currentSectionEl.style.transform = 'translateX(-100%)';
    currentSectionEl.style.opacity = '0';
    
    setTimeout(() => {
        // Remove active class from current section
        currentSectionEl.classList.remove('active');
        
        // Reset target section position and show it
        targetSectionEl.style.transform = 'translateX(0)';
        targetSectionEl.style.opacity = '1';
        targetSectionEl.classList.add('active');
        
        // Trigger section-specific animations
        triggerSectionAnimations(targetSection);
        
        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }, 400);
    
    currentSection = targetSection;
}

function triggerSectionAnimations(section) {
    switch (section) {
        case 'skills':
            setTimeout(() => animateSkillLevels(), 500);
            break;
        case 'journey':
            setTimeout(() => animateAchievements(), 300);
            break;
        case 'projects':
            setTimeout(() => animateProjects(), 400);
            break;
    }
}

// Hero Section Animations
function animateHeroElements() {
    // Animate code lines
    const codeLines = document.querySelectorAll('.code-line');
    codeLines.forEach((line, index) => {
        line.style.animationDelay = `${index * 0.1}s`;
    });
}

function startStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.dataset.target);
        const increment = target / 50;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 50);
    });
}

// function startTypingAnimation() {
//     const typingElement = document.querySelector('.typing-text');
//     if (!typingElement) return;
    
//     const messages = [
//         '"Building the future, one line at a time..."',
//         '"Code is poetry written in logic..."',
//         '"Innovation starts with imagination..."',
//         '"Debugging is like being a detective..."'
//     ];
    
//     let messageIndex = 0;
    
//     function typeMessage() {
//         const message = messages[messageIndex];
//         let charIndex = 0;
        
//         typingElement.textContent = '';
        
//         const typeInterval = setInterval(() => {
//             typingElement.textContent += message[charIndex];
//             charIndex++;
            
//             if (charIndex >= message.length) {
//                 clearInterval(typeInterval);
//                 setTimeout(() => {
//                     messageIndex = (messageIndex + 1) % messages.length;
//                     setTimeout(typeMessage, 1000);
//                 }, 3000);
//             }
//         }, 100);
//     }
    
//     setTimeout(typeMessage, 2000);
// }
// Find this function in your script.js and replace it:
function startTypingAnimation() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;
    
    // Custom messages for Bhargav's portfolio
    const messages = [
        '"Hello, I am Bhargav Indimandala"',
        '"Passionate Software Developer"',
        '"Ready to create amazing applications"'
    ];
    
    let messageIndex = 0;
    
    function typeMessage() {
        const message = messages[messageIndex];
        let charIndex = 0;
        
        typingElement.textContent = '';
        
        const typeInterval = setInterval(() => {
            typingElement.textContent += message[charIndex];
            charIndex++;
            
            if (charIndex >= message.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    messageIndex = (messageIndex + 1) % messages.length;
                    setTimeout(typeMessage, 1000);
                }, 3000);
            }
        }, 100);
    }
    
    setTimeout(typeMessage, 2000);
}
// Skills Section
function animateSkillLevels() {
    const levelBars = document.querySelectorAll('.level-bar');
    
    levelBars.forEach((bar, index) => {
        setTimeout(() => {
            const level = bar.dataset.level;
            bar.style.width = level + '%';
        }, index * 200);
    });
}

// Interactive Elements
function setupInteractiveElements() {
    // Skill nodes
    const skillNodes = document.querySelectorAll('.skill-node');
    skillNodes.forEach(node => {
        node.addEventListener('click', () => {
            node.style.transform = 'scale(1.1)';
            setTimeout(() => {
                node.style.transform = '';
            }, 300);
            playClickSound();
        });
    });
    
    // Project cards with 3D tilt
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
    
    // Achievement hover effects
    const achievements = document.querySelectorAll('.achievement.unlocked');
    achievements.forEach(achievement => {
        achievement.addEventListener('mouseenter', () => {
            achievement.style.transform = 'scale(1.05)';
        });
        
        achievement.addEventListener('mouseleave', () => {
            achievement.style.transform = '';
        });
    });
}

function animateAchievements() {
    const achievements = document.querySelectorAll('.achievement');
    achievements.forEach((achievement, index) => {
        setTimeout(() => {
            achievement.style.transform = 'translateX(0)';
            achievement.style.opacity = '1';
        }, index * 200);
    });
}

function animateProjects() {
    const projects = document.querySelectorAll('.project-card');
    projects.forEach((project, index) => {
        project.style.opacity = '0';
        project.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            project.style.transition = 'all 0.6s ease';
            project.style.opacity = '1';
            project.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Form Handlers
function setupFormHandlers() {
    const form = document.querySelector('.contact-form');
    const inputs = document.querySelectorAll('.form-group input, .form-group textarea');
    
    // Enhanced form validation
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('focus', clearFieldError);
    });
    
    form.addEventListener('submit', handleFormSubmission);
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldType = field.type;
    
    // Remove existing error styling
    field.style.borderColor = '';
    
    if (!value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (fieldType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    showFieldSuccess(field);
    return true;
}

function showFieldError(field, message) {
    field.style.borderColor = '#ff0080';
    // You could add error message display here
}

function showFieldSuccess(field) {
    field.style.borderColor = '#00ff88';
}

function clearFieldError(e) {
    const field = e.target;
    field.style.borderColor = '';
}

function handleFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    // Validate all fields
    let isValid = true;
    const inputs = e.target.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Please fix the errors above', 'error');
        return;
    }
    
    // Simulate form submission
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.textContent = '✓ Sent!';
        submitBtn.style.background = 'linear-gradient(45deg, #00ff88, #00f5ff)';
        
        showNotification(`Thank you, ${data.name}! Your message has been received. I'll get back to you at ${data.email} soon.`, 'success');
        
        e.target.reset();
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
        }, 3000);
    }, 2000);
    
    playClickSound();
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Scroll Animations
function setupScrollAnimations() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        observer.observe(item);
    });
}

// Sound Effects
function setupSoundEffects() {
    // Create audio context for better browser support
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        
        // Unlock audio context on first user interaction
        document.addEventListener('click', function unlockAudio() {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            document.removeEventListener('click', unlockAudio);
        });
        
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

function playClickSound() {
    try {
        // Create a simple click sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        
    } catch (e) {
        // Fallback: no sound
    }
}

// Utility Functions
function typeText(element, text, speed = 100) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Performance optimizations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized mouse move handler
const optimizedMouseMove = debounce((e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}, 16); // ~60fps

document.addEventListener('mousemove', optimizedMouseMove);

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    // Clean up any running intervals or animations
    particles = [];
    if (particleCanvas) {
        particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    }
});
// Update the navigation section order array
const sectionOrder = ['hero', 'about', 'skills', 'journey', 'projects', 'resume', 'contact'];

// Add resume section animation trigger
function triggerSectionAnimations(section) {
    switch (section) {
        case 'skills':
            setTimeout(() => animateSkillLevels(), 500);
            break;
        case 'journey':
            setTimeout(() => animateAchievements(), 300);
            break;
        case 'projects':
            setTimeout(() => animateProjects(), 400);
            break;
        case 'resume':
            setTimeout(() => animateResumeElements(), 300);
            break;
    }
}

// Add this new function
function animateResumeElements() {
    const highlights = document.querySelectorAll('.highlight-item');
    const actionCards = document.querySelectorAll('.action-card');
    
    highlights.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 150);
    });
    
    actionCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + index * 200);
    });
}
// Console art
console.log(`
    ╔══════════════════════════════════════╗
    ║                                      ║
    ║        BHARGAV INDIMANDALA          ║
    ║     Interactive Portfolio v2.0       ║
    ║                                      ║
    ║  Built with: HTML5, CSS3, Vanilla JS ║
    ║  Features: Particles, 3D Effects,    ║
    ║           Terminal UI, Animations    ║
    ║                                      ║
    ║  Contact: bhargavchowdhary18@gmail.com ║
    ║  GitHub: github.com/Bhargav-indimandala ║
    ║                                      ║
    ╚══════════════════════════════════════╝
`);

console.log('%c🚀 Portfolio Loaded Successfully!', 'color: #00f5ff; font-size: 16px; font-weight: bold;');
console.log('%cPress arrow keys to navigate between sections', 'color: #00ff88; font-size: 12px;');
console.log('%cPress Enter during terminal intro to skip', 'color: #ff0080; font-size: 12px;');
