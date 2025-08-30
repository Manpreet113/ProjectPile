import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { PROJECTS, getProjectConfig } from './screenshot-config.js';

// Theme-specific browser configurations
const THEME_CONFIGS = {
    light: {
        colorScheme: 'light',
        prefersColorScheme: 'light',
        emulateMedia: [{ media: 'prefers-color-scheme', value: 'light' }]
    },
    dark: {
        colorScheme: 'dark', 
        prefersColorScheme: 'dark',
        emulateMedia: [{ media: 'prefers-color-scheme', value: 'dark' }]
    }
};

async function captureThemeScreenshot(browser, project, theme, attempt = 1) {
    const config = getProjectConfig(project);
    const themeConfig = THEME_CONFIGS[theme];
    const isRetry = attempt > 1;
    
    console.log(`📸 ${isRetry ? `Retry ${attempt}/${config.maxRetries} - ` : ''}Capturing ${theme} theme screenshot for ${project.name}...`);
    
    const context = await browser.newContext({
        viewport: config.viewport,
        colorScheme: themeConfig.colorScheme,
        reducedMotion: 'reduce',
    });
    
    const page = await context.newPage();
    
    try {
        // Set theme preference
        await page.emulateMedia({ colorScheme: themeConfig.prefersColorScheme });
        
        // Navigate to the page
        await page.goto(project.url, { 
            waitUntil: 'networkidle',
            timeout: config.timeout 
        });
        
        // Try to set theme via common methods
        await setPageTheme(page, theme);
        
        // Wait for theme to apply and page to settle
        await page.waitForTimeout(config.waitAfterLoad + 1000);
        
        // Generate filename with theme suffix
        const baseName = project.filename.replace('.png', '');
        const themedFilename = `${baseName}-${theme}.png`;
        
        const outputDir = path.join(process.cwd(), config.outputDir);
        const screenshotPath = path.join(outputDir, themedFilename);
        
        await page.screenshot({
            path: screenshotPath,
            type: config.imageFormat,
            fullPage: config.fullPage,
        });
        
        console.log(`✅ ${theme.charAt(0).toUpperCase() + theme.slice(1)} screenshot saved: ${themedFilename}`);
        return { success: true, project: project.name, theme, filename: themedFilename, attempt };
        
    } catch (error) {
        console.error(`❌ Attempt ${attempt} failed for ${project.name} (${theme}):`, error.message);
        
        // Retry logic
        if (attempt < config.maxRetries) {
            console.log(`⏳ Retrying ${theme} theme in ${config.retryDelay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, config.retryDelay));
            return captureThemeScreenshot(browser, project, theme, attempt + 1);
        }
        
        return { success: false, project: project.name, theme, error: error.message, attempts: attempt };
    } finally {
        await context.close();
    }
}

// Helper function to set page theme using common methods
async function setPageTheme(page, theme) {
    try {
        // Method 1: Try to click theme toggle button (common patterns)
        const themeButtons = [
            `[data-theme="${theme}"]`,
            `[data-theme-toggle]`,
            `.theme-toggle`,
            `button[aria-label*="theme"]`,
            `button[aria-label*="${theme}"]`,
            `.dark-mode-toggle`,
            `.theme-switcher`
        ];
        
        for (const selector of themeButtons) {
            try {
                const button = await page.$(selector);
                if (button) {
                    await button.click();
                    await page.waitForTimeout(500);
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        // Method 2: Try to set localStorage theme
        await page.evaluate((theme) => {
            const themeKeys = ['theme', 'darkMode', 'colorScheme', 'preferred-theme'];
            themeKeys.forEach(key => {
                localStorage.setItem(key, theme);
                localStorage.setItem(key, theme === 'dark' ? 'dark' : 'light');
            });
        }, theme);
        
        // Method 3: Try to add theme class to document
        await page.evaluate((theme) => {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
            document.documentElement.setAttribute('data-theme', theme);
            document.body.classList.remove('light', 'dark');
            document.body.classList.add(theme);
        }, theme);
        
        // Method 4: Dispatch theme change events
        await page.evaluate((theme) => {
            window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'theme',
                newValue: theme,
                storageArea: localStorage
            }));
        }, theme);
        
    } catch (error) {
        console.warn(`⚠️ Could not set theme for page, relying on browser preference:`, error.message);
    }
}

async function captureProjectScreenshots(browser, project) {
    const config = getProjectConfig(project);
    const results = [];
    
    if (!config.themes.enabled) {
        // Fallback to single screenshot if themes disabled
        const result = await captureThemeScreenshot(browser, project, config.themes.defaultTheme);
        return [result];
    }
    
    // Capture screenshot for each theme
    for (const theme of config.themes.capture) {
        const result = await captureThemeScreenshot(browser, project, theme);
        results.push(result);
        
        // Small delay between theme captures
        if (config.themes.capture.indexOf(theme) < config.themes.capture.length - 1) {
            await new Promise(resolve => setTimeout(resolve, config.themeWaitDelay));
        }
    }
    
    return results;
}

async function generateAllScreenshots() {
    const config = getProjectConfig(PROJECTS[0]); // Get base config
    const outputDir = path.join(process.cwd(), config.outputDir);
    
    console.log('🚀 Starting theme-aware screenshot generation...');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📊 Processing ${PROJECTS.length} projects with ${config.themes.capture.length} themes each...`);
    
    if (config.themes.enabled) {
        console.log(`🎨 Themes: ${config.themes.capture.join(', ')}`);
    }
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Check if running in a limited environment (like CI/CD)
    const isLimitedEnv = process.env.VERCEL || process.env.NETLIFY || process.env.CI;
    if (isLimitedEnv) {
        console.log('⚠️ Running in deployment environment, using optimized browser config...');
        config.browser.args.push(
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--run-all-compositor-stages-before-draw',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-field-trial-config',
            '--disable-ipc-flooding-protection'
        );
    }
    
    let browser;
    try {
        // Launch browser
        browser = await chromium.launch(config.browser);
        
        const allResults = [];
    
        // Capture screenshots for each project (with all themes)
        for (const project of PROJECTS) {
            console.log(`\n📂 Processing ${project.name}...`);
            
            const projectResults = await captureProjectScreenshots(browser, project);
            allResults.push(...projectResults);
            
            // Delay between projects
            if (PROJECTS.indexOf(project) < PROJECTS.length - 1) {
                await new Promise(resolve => setTimeout(resolve, config.delayBetweenCaptures));
            }
        }
        
        // Calculate statistics
        const totalExpected = PROJECTS.length * config.themes.capture.length;
        const successful = allResults.filter(r => r.success).length;
        const failed = allResults.filter(r => !r.success);
        const retried = allResults.filter(r => r.attempt > 1).length;
        
        // Group results by theme
        const byTheme = {};
        config.themes.capture.forEach(theme => {
            byTheme[theme] = allResults.filter(r => r.theme === theme && r.success).length;
        });
        
        console.log('\n📊 Screenshot Generation Summary:');
        console.log(`✅ Total successful: ${successful}/${totalExpected}`);
        
        if (config.themes.enabled) {
            console.log('\n🎨 By theme:');
            Object.entries(byTheme).forEach(([theme, count]) => {
                console.log(`  ${theme}: ${count}/${PROJECTS.length}`);
            });
        }
        
        if (retried > 0) {
            console.log(`\n🔄 Required retries: ${retried}`);
        }
        
        if (failed.length > 0) {
            console.log('\n❌ Failed:');
            failed.forEach(f => console.log(`  - ${f.project} (${f.theme}): ${f.error}${f.attempts ? ` (${f.attempts} attempts)` : ''}`));
        }
        
        console.log('\n🎉 Screenshot generation complete!');
        
        return {
            total: totalExpected,
            successful: successful,
            failed: failed.length,
            retried: retried,
            byTheme: byTheme,
            results: allResults
        };
        
    } catch (error) {
        console.error('💥 Browser launch or screenshot generation failed:', error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Add support for command line usage
if (import.meta.url === `file://${process.argv[1]}`) {
    generateAllScreenshots()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('💥 Script failed:', error);
            process.exit(1);
        });
}

export { generateAllScreenshots };
