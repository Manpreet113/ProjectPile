#!/usr/bin/env node

/**
 * Vercel build script that handles screenshot generation gracefully
 * Falls back to build without screenshots if generation fails
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const isVercel = process.env.VERCEL === '1';
const isCI = process.env.CI === 'true';

console.log('🔧 Starting Vercel-optimized build process...');

if (isVercel || isCI) {
    console.log('🚀 Detected deployment environment');
}

// Function to run a command and return a promise
function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        console.log(`📋 Running: ${command} ${args.join(' ')}`);
        
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
        
        child.on('error', (error) => {
            reject(error);
        });
    });
}

// Check if screenshots exist
function checkScreenshotsExist() {
    const assetsDir = path.join(process.cwd(), 'public', 'assets');
    const requiredFiles = [
        'hyprl-light.png', 'hyprl-dark.png',
        'portfolio-light.png', 'portfolio-dark.png',
        'projectpile-light.png', 'projectpile-dark.png',
        'notehole-light.png', 'notehole-dark.png'
    ];
    
    const existing = requiredFiles.filter(file => 
        existsSync(path.join(assetsDir, file))
    );
    
    console.log(`📊 Found ${existing.length}/${requiredFiles.length} screenshot files`);
    return existing.length === requiredFiles.length;
}

async function main() {
    try {
        // Step 1: Try to install Playwright browsers
        if (isVercel || isCI) {
            try {
                console.log('🎭 Installing Playwright browsers...');
                await runCommand('npx', ['playwright', 'install', 'chromium', '--with-deps']);
                console.log('✅ Playwright browsers installed successfully');
            } catch (error) {
                console.warn('⚠️ Failed to install Playwright browsers:', error.message);
            }
        }
        
        // Step 2: Try to generate screenshots
        const screenshotsExist = checkScreenshotsExist();
        
        if (!screenshotsExist) {
            try {
                console.log('📸 Generating screenshots...');
                await runCommand('npm', ['run', 'screenshots']);
                console.log('✅ Screenshots generated successfully');
            } catch (error) {
                console.warn('⚠️ Screenshot generation failed:', error.message);
                console.log('📦 Proceeding with build using existing or fallback screenshots');
            }
        } else {
            console.log('✅ Screenshots already exist, skipping generation');
        }
        
        // Step 3: Build the project
        console.log('🏗️ Building Astro project...');
        await runCommand('npx', ['astro', 'build']);
        console.log('🎉 Build completed successfully!');
        
    } catch (error) {
        console.error('💥 Build failed:', error.message);
        process.exit(1);
    }
}

main();
