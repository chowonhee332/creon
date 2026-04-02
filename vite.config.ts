import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';

// Plugin to auto-generate home_images.json when files in public/images/home/ change
const homeImagesPlugin = () => {
  const generateHomeImages = () => {
    try {
      const homeDir = './public/images/home/';
      const outputFile = './public/home_images.json';
      
      if (!fs.existsSync(homeDir)) {
        console.warn('⚠️ Home directory not found:', homeDir);
        return;
      }

      // Recursively get all files from home directory and subdirectories
      const getAllFiles = (dir: string, basePath: string = ''): string[] => {
        let results: string[] = [];
        if (!fs.existsSync(dir)) {
          return results;
        }
        
        const list = fs.readdirSync(dir);
        
        list.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          const relativePath = basePath ? `${basePath}/${file}` : file;
          
          if (stat.isDirectory()) {
            // Recursively scan subdirectories (veo2, veo3, image, etc.)
            results = results.concat(getAllFiles(filePath, relativePath));
          } else if (/\.(png|jpg|jpeg|webp|mp4|webm)$/i.test(file)) {
            results.push(relativePath);
          }
        });
        
        return results;
      };

      const getMimeType = (filename: string) => {
        if (filename.endsWith('.mp4')) return 'video/mp4';
        if (filename.endsWith('.webm')) return 'video/webm';
        if (filename.endsWith('.png')) return 'image/png';
        if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
        if (filename.endsWith('.webp')) return 'image/webp';
        return 'image/png';
      };
      
      const allFiles = getAllFiles(homeDir);
      
      // Sort files: videos first, then images
      const sortedFiles = allFiles.sort((a, b) => {
        const aIsVideo = /\.(mp4|webm)$/i.test(a);
        const bIsVideo = /\.(mp4|webm)$/i.test(b);
        
        if (aIsVideo && !bIsVideo) return -1; // video comes first
        if (!aIsVideo && bIsVideo) return 1;   // image comes after
        return a.localeCompare(b); // same type, sort alphabetically
      });
      
      const homeImages = sortedFiles.map((filePath, index) => ({
        id: `home_${index + 1}`,
        name: path.basename(filePath),
        type: getMimeType(filePath),
        dataUrl: `/images/home/${filePath}`,
        timestamp: Date.now() - (index * 60000)
      }));

      fs.writeFileSync(outputFile, JSON.stringify(homeImages, null, 2));
      console.log(`✅ Auto-generated ${allFiles.length} home images in ${outputFile}`);
      console.log(`   - Files from veo2/: ${allFiles.filter(f => f.includes('veo2/')).length}`);
      console.log(`   - Files from veo3/: ${allFiles.filter(f => f.includes('veo3/')).length}`);
    } catch (error) {
      console.error('❌ Failed to generate home images:', error);
    }
  };

  return {
    name: 'home-images-generator',
    buildStart() {
      generateHomeImages();
    },
    configureServer(server) {
      // Watch for changes in public/images/home/ - using chokidar-like approach
      // Note: We'll use Vite's built-in watcher instead of fs.watch to avoid EMFILE errors
      // The watch is handled by Vite's server watcher which is more efficient
    }
  };
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '127.0.0.1',
        watch: {
          ignored: ['**/node_modules/**', '**/.git/**', '**/public/images/**']
        }
      },
      plugins: [homeImagesPlugin()],
      define: {
        // ⚠️ 주의: VITE_ 접두사를 붙이면 클라이언트에 노출됩니다!
        // API 키는 서버에서만 사용하거나 Serverless Functions를 통해 처리해야 합니다.
        // 'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // 'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        exclude: ['@imgly/background-removal']
      },
      assetsInclude: ['**/*.wasm']
    };
});
