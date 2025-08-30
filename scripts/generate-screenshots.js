import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { PROJECTS, getProjectConfig } from './screenshot-config.js';

async function captureScreenshot(browser, project, attempt = 1) {
    const config = getProjectConfig(project);
    const isRetry = attempt > 1;
    
    console.log(`📸 ${isRetry ? `Retry ${attempt}/${config.maxRetries} - ` : ''}Capturing screenshot for ${project.name}...`);
    
    const context = await browser.newContext({
        viewport: config.viewport,
        // Disable animations for consistent screenshots
        reducedMotion: 'reduce',
    });
    
    const page = await context.newPage();
    
    try {
        // Navigate to the page
        await page.goto(project.url, { 
            waitUntil: 'networkidle',
            timeout: config.timeout 
        });
        
        // Wait additional time for any remaining animations/lazy loading
        await page.waitForTimeout(config.waitAfterLoad);
        
        // Take the screenshot
        const outputDir = path.join(process.cwd(), config.outputDir);
        const screenshotPath = path.join(outputDir, project.filename);
        
        await page.screenshot({
            path: screenshotPath,
            type: config.imageFormat,
            fullPage: config.fullPage,
        });
        
        console.log(`✅ Screenshot saved: ${project.filename}`);
        return { success: true, project: project.name, attempt };
        
    } catch (error) {
        console.error(`❌ Attempt ${attempt} failed for ${project.name}:`, error.message);
        
        // Retry logic
        if (attempt < config.maxRetries) {
            console.log(`⏳ Retrying in ${config.retryDelay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, config.retryDelay));
            return captureScreenshot(browser, project, attempt + 1);
        }
        
        return { success: false, project: project.name, error: error.message, attempts: attempt };
    } finally {
        await context.close();
    }
}

async function generateAllScreenshots() {
    const config = getProjectConfig(PROJECTS[0]); // Get base config
    const outputDir = path.join(process.cwd(), config.outputDir);
    
    console.log('🚀 Starting screenshot generation...');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📊 Processing ${PROJECTS.length} projects...`);
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Launch browser
    const browser = await chromium.launch(config.browser);
    
    const results = [];
    
    // Capture screenshots sequentially to avoid overwhelming the sites
    for (const project of PROJECTS) {
        const result = await captureScreenshot(browser, project);
        results.push(result);
        
        // Delay between captures (from config)
        if (PROJECTS.indexOf(project) < PROJECTS.length - 1) {
            await new Promise(resolve => setTimeout(resolve, config.delayBetweenCaptures));
        }
    }
    
    await browser.close();
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);
    const retried = results.filter(r => r.attempt > 1).length;
    
    console.log('\n📊 Screenshot Generation Summary:');
    console.log(`✅ Successful: ${successful}/${PROJECTS.length}`);
    if (retried > 0) {
        console.log(`🔄 Required retries: ${retried}`);
    }
    
    if (failed.length > 0) {
        console.log('❌ Failed:');
        failed.forEach(f => console.log(`  - ${f.project}: ${f.error} (${f.attempts} attempts)`));
    }
    
    console.log('\n🎉 Screenshot generation complete!');
    
    return {
        total: PROJECTS.length,
        successful: successful,
        failed: failed.length,
        retried: retried,
        results: results
    };
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
