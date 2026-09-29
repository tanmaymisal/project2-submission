import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js'; 

// Load environment variables
dotenv.config();

/**
 * Main entry point for the Claude Multi-Agent Code Review System
 * Usage: npm run dev <owner> <repo> <pr-number>
 */
async function main() {
  const [owner, repo, prStr] = process.argv.slice(2);

  // TODO: Validate command line arguments
  if (!owner || !repo || !prStr) {
    console.error('Error: Missing arguments.');
    console.error('Usage: npm run dev <owner> <repo> <pr-number>');
    process.exit(1);
  }

  const prNumber = parseInt(prStr, 10);
  if (isNaN(prNumber)) {
    console.error('Error: PR number must be a valid integer.');
    process.exit(1);
  }

  // TODO: Validate authentication (choose ONE method)
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasBedrock = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

  if (hasBedrock) {
    if (!process.env.AWS_REGION) {
      console.error('Error: AWS_REGION is required when using AWS Bedrock authentication.');
      process.exit(1);
    }
    console.log('🔐 Using AWS Bedrock authentication');
  } else if (hasAnthropic) {
    console.log('🔐 Using Anthropic API authentication');
  } else {
    console.error('Error: Missing Authentication.');
    console.error('Please configure either ANTHROPIC_API_KEY OR AWS credentials.');
    process.exit(1);
  }

  // TODO: Validate GITHUB_TOKEN environment variable
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('Error: GITHUB_TOKEN environment variable is required.');
    console.error('GitHub MCP needs this token to fetch pull request files.');
    console.error('Add GITHUB_TOKEN=ghp_your_token_here to your .env file.');
    process.exit(1);
  }

  // TODO: Validate ANTHROPIC_MODEL environment variable
  
  if (!process.env.ANTHROPIC_MODEL) {
    console.error('Error: ANTHROPIC_MODEL environment variable is required.');
    process.exit(1);
  }

  console.log(`\n🚀 Starting code review for: ${owner}/${repo}#${prNumber}`);
  
  try {
    // TODO: Create orchestrator instance
    const orchestrator = new CodeReviewOrchestrator();
    
    // TODO: Call .reviewPullRequest(owner, repo, prNumber);
    const report = await orchestrator.reviewPullRequest(owner, repo, prNumber);
    
    // TODO: Generate formatted reports using ReportGenerator
    console.log('\nGenerating reports...');
    const generator = new ReportGenerator();
    
    // Generate the strings
    const jsonOutput = generator.generateJSONReport(report);
    const mdOutput = generator.generateMarkdownReport(report);
    const htmlOutput = generator.generateHTMLReport(report);
    
    // Ensure the reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Define file paths
    const prefix = `${repo}-pr${prNumber}`;
    const jsonPath = path.join(reportsDir, `${prefix}.json`);
    const mdPath = path.join(reportsDir, `${prefix}.md`);
    const htmlPath = path.join(reportsDir, `${prefix}.html`);
    
    // Save reports to 'reports/' directory with appropriate filenames
    fs.writeFileSync(jsonPath, jsonOutput);
    fs.writeFileSync(mdPath, mdOutput);
    fs.writeFileSync(htmlPath, htmlOutput);
    
    console.log(`\n✅ Success! Reports generated and saved to the 'reports/' directory:`);
    console.log(`  - ${jsonPath}`);
    console.log(`  - ${mdPath}`);
    console.log(`  - ${htmlPath}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
