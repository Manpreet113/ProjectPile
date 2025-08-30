import fs from 'fs/promises';
import path from 'path';
import { PROJECTS } from '../src/data/projects.js';

async function verifyThemeScreenshots() {
    console.log('🔍 Verifying theme-aware screenshots...');
    
    const assetsDir = path.join(process.cwd(), 'public', 'assets');
    const themes = ['light', 'dark'];
    
    let allFound = true;
    const results = [];
    
    for (const project of PROJECTS) {
        console.log(`\n📂 Checking ${project.name}:`);
        
        for (const theme of themes) {
            const expectedFile = project.thumbnails[theme].replace('/assets/', '');
            const filePath = path.join(assetsDir, expectedFile);
            
            try {
                const stats = await fs.stat(filePath);
                const sizeKB = Math.round(stats.size / 1024);
                console.log(`  ✅ ${theme}: ${expectedFile} (${sizeKB} KB)`);
                results.push({ project: project.name, theme, found: true, size: sizeKB });
            } catch (error) {
                console.log(`  ❌ ${theme}: ${expectedFile} - NOT FOUND`);
                results.push({ project: project.name, theme, found: false });
                allFound = false;
            }
        }
    }
    
    console.log('\n📊 Summary:');
    const totalExpected = PROJECTS.length * themes.length;
    const totalFound = results.filter(r => r.found).length;
    console.log(`✅ Found: ${totalFound}/${totalExpected} screenshots`);
    
    if (allFound) {
        console.log('🎉 All theme-aware screenshots are ready!');
        
        // Show size comparison
        console.log('\n📈 Theme comparison (sizes):');
        for (const project of PROJECTS) {
            const lightResult = results.find(r => r.project === project.name && r.theme === 'light');
            const darkResult = results.find(r => r.project === project.name && r.theme === 'dark');
            
            if (lightResult && darkResult) {
                const sizeDiff = darkResult.size - lightResult.size;
                const diffSign = sizeDiff > 0 ? '+' : '';
                console.log(`  ${project.name}: Light ${lightResult.size}KB, Dark ${darkResult.size}KB (${diffSign}${sizeDiff}KB)`);
            }
        }
    } else {
        console.log('❌ Some screenshots are missing. Run: npm run screenshots');
    }
    
    return { success: allFound, results };
}

if (import.meta.url === `file://${process.argv[1]}`) {
    verifyThemeScreenshots()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('💥 Verification failed:', error);
            process.exit(1);
        });
}
