import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// List all items in a directory
export async function listDir(dirPath: string): Promise<string[]> {
  try {
    const items = await fs.promises.readdir(dirPath);
    return items;
  } catch (error) {
    throw new Error(`Failed to list directory: ${error}`);
  }
}

// List only files in a directory (not subdirectories)
export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    const items = await fs.promises.readdir(dirPath);
    const files: string[] = [];
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = await fs.promises.stat(fullPath);
      if (stat.isFile()) {
        files.push(item);
      }
    }
    
    return files;
  } catch (error) {
    throw new Error(`Failed to list files: ${error}`);
  }
}

// List only subdirectories
export async function listSubdirs(dirPath: string): Promise<string[]> {
  try {
    const items = await fs.promises.readdir(dirPath);
    const dirs: string[] = [];
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = await fs.promises.stat(fullPath);
      if (stat.isDirectory()) {
        dirs.push(item);
      }
    }
    
    return dirs;
  } catch (error) {
    throw new Error(`Failed to list subdirectories: ${error}`);
  }
}

// Read entire file content
export async function readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  try {
    const content = await fs.promises.readFile(filePath, encoding);
    return content;
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

// Read file by line range (1-indexed, inclusive)
export async function readFileByLineRange(
  filePath: string,
  startLine: number,
  endLine: number,
  encoding: BufferEncoding = 'utf-8'
): Promise<string> {
  try {
    const content = await fs.promises.readFile(filePath, encoding);
    const lines = content.split('\n');
    
    if (startLine < 1 || endLine < 1) {
      throw new Error('Line numbers must be >= 1');
    }
    
    if (startLine > endLine) {
      throw new Error('Start line must be <= end line');
    }
    
    const selectedLines = lines.slice(startLine - 1, endLine);
    return selectedLines.join('\n');
  } catch (error) {
    throw new Error(`Failed to read file by line range: ${error}`);
  }
}

// Write content to file
export async function writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  try {
    await fs.promises.writeFile(filePath, content, encoding);
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
}

// Append content to file
export async function appendFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  try {
    await fs.promises.appendFile(filePath, content, encoding);
  } catch (error) {
    throw new Error(`Failed to append to file: ${error}`);
  }
}

// Delete file
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
}

// Create directory (recursive by default)
export async function createDir(dirPath: string, recursive: boolean = true): Promise<void> {
  try {
    await fs.promises.mkdir(dirPath, { recursive });
  } catch (error) {
    throw new Error(`Failed to create directory: ${error}`);
  }
}

// Delete directory
export async function deleteDir(dirPath: string, recursive: boolean = true): Promise<void> {
  try {
    await fs.promises.rm(dirPath, { recursive, force: true });
  } catch (error) {
    throw new Error(`Failed to delete directory: ${error}`);
  }
}

// Check if path exists
export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.promises.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

// Get file/directory stats
export async function getStats(targetPath: string): Promise<fs.Stats> {
  try {
    return await fs.promises.stat(targetPath);
  } catch (error) {
    throw new Error(`Failed to get stats: ${error}`);
  }
}

// Execute terminal command
export async function executeCommand(command: string, cwd?: string): Promise<{ stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    return { stdout, stderr };
  } catch (error: any) {
    throw new Error(`Command execution failed: ${error.message}\nStderr: ${error.stderr}`);
  }
}

// Execute command and return only stdout
export async function executeCommandSimple(command: string, cwd?: string): Promise<string> {
  const { stdout } = await executeCommand(command, cwd);
  return stdout.trim();
}

// Copy file
export async function copyFile(source: string, destination: string): Promise<void> {
  try {
    await fs.promises.copyFile(source, destination);
  } catch (error) {
    throw new Error(`Failed to copy file: ${error}`);
  }
}

// Move/rename file or directory
export async function move(source: string, destination: string): Promise<void> {
  try {
    await fs.promises.rename(source, destination);
  } catch (error) {
    throw new Error(`Failed to move: ${error}`);
  }
}

// Example usage
async function main() {
  try {
    // List directory contents
    console.log('Files in current directory:');
    const files = await listFiles('.');
    console.log(files);

    // Read file by line range
    console.log('\nReading lines 1-5 from a file:');
    const lines = await readFileByLineRange('./example.txt', 1, 5);
    console.log(lines);

    // Execute command
    console.log('\nExecuting "ls -la":');
    const { stdout } = await executeCommand('ls -la');
    console.log(stdout);

    // Create and write to file
    await writeFile('./test.txt', 'Hello, World!');
    console.log('\nFile created successfully');

    // Read the file
    const content = await readFile('./test.txt');
    console.log('File content:', content);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run examples
// main();