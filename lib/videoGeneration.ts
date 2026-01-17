import { Repository } from "@/types/repository";

// Video generation service that supports multiple AI video providers
export type VideoProvider = "runway" | "nano-banana" | "sora" | "veo" | "mock";

interface VideoGenerationOptions {
  provider?: VideoProvider;
  duration?: number; // seconds
  aspectRatio?: "16:9" | "9:16" | "1:1";
  quality?: "sd" | "hd" | "4k";
  useReadme?: boolean; // Use README content for video prompt
}

interface GeneratedVideo {
  id: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  prompt: string;
  status: "generating" | "ready" | "failed";
}

interface ReadmeContent {
  title: string;
  description: string;
  features: string[];
  techStack: string[];
  badges: string[];
}

/**
 * Fetch and parse README content from a repository
 */
export async function fetchReadmeContent(repo: Repository): Promise<ReadmeContent | null> {
  try {
    const [owner, repoName] = repo.full_name.split("/");
    
    // Try different README filenames
    const readmeFiles = ["README.md", "readme.md", "README.MD", "Readme.md"];
    let readmeContent = "";
    
    for (const filename of readmeFiles) {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repoName}/main/${filename}`
        );
        if (response.ok) {
          readmeContent = await response.text();
          break;
        }
        // Try master branch
        const masterResponse = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repoName}/master/${filename}`
        );
        if (masterResponse.ok) {
          readmeContent = await masterResponse.text();
          break;
        }
      } catch {
        continue;
      }
    }

    if (!readmeContent) {
      return null;
    }

    // Parse README content
    return parseReadmeContent(readmeContent, repo);
  } catch (error) {
    console.error(`Error fetching README for ${repo.full_name}:`, error);
    return null;
  }
}

/**
 * Parse README markdown content to extract key information
 */
function parseReadmeContent(content: string, repo: Repository): ReadmeContent {
  // Extract title (first H1)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : repo.name;

  // Extract description (first paragraph after title or from badges)
  const descMatch = content.match(/^(?!#|!\[|<|```)[A-Za-z].+$/m);
  const description = descMatch 
    ? descMatch[0].slice(0, 200).trim() 
    : repo.description || "An awesome project";

  // Extract features (look for bullet points after "Features" heading)
  const features: string[] = [];
  const featuresMatch = content.match(/(?:##?\s*(?:Features|What|Why|Benefits)[^\n]*\n)((?:\s*[-*]\s*.+\n?)+)/i);
  if (featuresMatch) {
    const bulletPoints = featuresMatch[1].match(/[-*]\s*(.+)/g) || [];
    features.push(...bulletPoints.slice(0, 5).map((p) => p.replace(/^[-*]\s*/, "").trim()));
  }

  // Extract tech stack (look for technology mentions)
  const techStack: string[] = [];
  const techPatterns = [
    /(?:Built with|Powered by|Tech(?:nology)?(?:\s+Stack)?|Stack)[:\s]+(.+)/i,
    /(?:React|Vue|Angular|Next\.js|Node\.js|Python|TypeScript|JavaScript|Rust|Go)/gi,
  ];
  
  for (const pattern of techPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      techStack.push(...matches.slice(0, 4).map((m) => m.trim()));
    }
  }

  // Extract badges info
  const badges: string[] = [];
  const badgeMatches = content.match(/!\[([^\]]+)\]/g) || [];
  badges.push(...badgeMatches.slice(0, 3).map((b) => b.replace(/!\[|\]/g, "")));

  return { title, description, features, techStack, badges };
}

/**
 * Create a video prompt from README content
 * This generates more informative, content-rich videos
 */
export async function createReadmeBasedPrompt(repo: Repository): Promise<string> {
  const readme = await fetchReadmeContent(repo);
  const language = repo.language || "programming";
  const stars = repo.stargazers_count;

  if (!readme) {
    // Fallback to basic prompt
    return createVideoPrompt(repo);
  }

  // Create an engaging, informative video prompt based on README
  const featuresList = readme.features.length > 0 
    ? `Key features: ${readme.features.slice(0, 3).join(", ")}.` 
    : "";
  
  const techInfo = readme.techStack.length > 0
    ? `Built with ${readme.techStack.slice(0, 3).join(", ")}.`
    : `A ${language} project.`;

  const prompts = [
    // Educational overview style
    `Create an engaging educational video about "${readme.title}". 
     Open with the project logo/name in a modern tech intro.
     Show animated text explaining: "${readme.description.slice(0, 100)}".
     ${featuresList}
     Display code snippets highlighting the project's capabilities.
     Show stats: ${stars.toLocaleString()} GitHub stars with sparkling animations.
     ${techInfo}
     End with a call-to-action: "Check it out on GitHub".
     Style: Clean, modern, educational TikTok/Reels format. 9:16 vertical.`,

    // Demo showcase style  
    `Generate a product demo video for "${readme.title}" - ${readme.description.slice(0, 80)}.
     Start with a sleek intro animation featuring the project name.
     Show simulated UI demonstrating the project in action.
     ${featuresList}
     Animate key statistics: ${stars.toLocaleString()} stars, ${repo.forks_count} forks.
     Include developer testimonials/reactions style animations.
     ${techInfo}
     Modern, fast-paced editing. Mobile-first vertical format.`,

    // Tutorial teaser style
    `Create a "What is ${readme.title}?" explainer video.
     Hook: Start with a problem statement that the project solves.
     Solution: "${readme.description}".
     Show animated diagrams of how it works.
     ${featuresList}
     Quick code snippets showing ease of use.
     Community proof: ${stars.toLocaleString()} developers love this.
     ${techInfo}
     Style: Engaging, educational, TikTok tutorial format.`,
  ];

  const promptIndex = Math.abs(hashCode(repo.name)) % prompts.length;
  return prompts[promptIndex];
}

/**
 * Generate a video prompt from repository data
 */
export function createVideoPrompt(repo: Repository): string {
  const language = repo.language || "programming";
  const description = repo.description || "a coding project";
  const stars = repo.stargazers_count;

  // Create an engaging video prompt
  const prompts = [
    `Create a cinematic tech showcase video featuring "${
      repo.name
    }", a ${language} project. 
     Show abstract code flowing on screens, futuristic UI elements, and digital particles. 
     Display the project name prominently with glowing effects. ${description}. 
     Include visual representations of ${stars.toLocaleString()} stars as glowing particles.
     Style: Modern, tech, dark theme with neon accents. Smooth camera movements.`,

    `Generate a dynamic video presentation for the GitHub project "${
      repo.name
    }". 
     Show a modern developer workspace with multiple screens displaying ${language} code.
     Animate code compiling, terminal commands executing, and graphs showing growth.
     Feature holographic UI elements showing ${stars.toLocaleString()} stars and ${
      repo.forks_count
    } forks.
     ${description}. Style: Futuristic, professional, high-tech aesthetic.`,

    `Create a TikTok-style vertical video showcasing "${
      repo.name
    }" - a trending ${language} repository.
     Start with the GitHub logo, transition to animated code snippets in ${language}.
     Show a particle effect forming the number ${stars.toLocaleString()} (star count).
     Include trending charts going up, developer avatars, and commit animations.
     ${description}. Mood: Energetic, modern, viral tech content. 9:16 aspect ratio.`,

    `Generate an engaging tech reveal video for "${repo.name}". 
     Open with a matrix-style rain of ${language} code. Zoom into a futuristic IDE interface.
     Show real-time coding visualization, git branches merging, and CI/CD pipelines.
     Display stats: ${stars.toLocaleString()} stars, ${
      repo.forks_count
    } forks floating in 3D space.
     ${description}. Style: Dark theme, neon green/blue accents, cyberpunk aesthetic.`,
  ];

  // Rotate through different prompt styles
  const promptIndex = Math.abs(hashCode(repo.name)) % prompts.length;
  return prompts[promptIndex];
}

/**
 * Generate a video using the specified AI provider
 */
export async function generateRepoVideo(
  repo: Repository,
  options: VideoGenerationOptions = {}
): Promise<GeneratedVideo> {
  const {
    provider = "mock",
    duration = 15,
    aspectRatio = "9:16",
    quality = "hd",
    useReadme = true, // Default to using README content
  } = options;

  // Get prompt - prefer README-based if enabled
  let prompt: string;
  if (useReadme) {
    prompt = await createReadmeBasedPrompt(repo);
  } else {
    prompt = createVideoPrompt(repo);
  }

  try {
    switch (provider) {
      case "runway":
        return await generateWithRunway(repo, prompt, options);

      case "nano-banana":
        return await generateWithNanoBanana(repo, prompt, options);

      case "sora":
        return await generateWithSora(repo, prompt, options);

      case "veo":
        return await generateWithVeo(repo, prompt, options);

      case "mock":
      default:
        return generateMockVideo(repo, prompt);
    }
  } catch (error) {
    console.error(`Error generating video with ${provider}:`, error);
    // Fallback to mock video
    return generateMockVideo(repo, prompt);
  }
}

/**
 * Runway ML Gen-4 Integration
 */
async function generateWithRunway(
  repo: Repository,
  prompt: string,
  options: VideoGenerationOptions
): Promise<GeneratedVideo> {
  // Runway API integration
  const apiKey = process.env.NEXT_PUBLIC_RUNWAY_API_KEY;

  if (!apiKey) {
    console.warn("Runway API key not found, using mock video");
    return generateMockVideo(repo, prompt);
  }

  const response = await fetch("https://api.runwayml.com/v1/generate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      duration: options.duration,
      aspect_ratio: options.aspectRatio,
      model: "gen4",
    }),
  });

  if (!response.ok) {
    throw new Error(`Runway API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    url: data.video_url,
    thumbnailUrl: data.thumbnail_url,
    duration: options.duration || 15,
    prompt,
    status: "ready",
  };
}

/**
 * Nano Banana Integration
 */
async function generateWithNanoBanana(
  repo: Repository,
  prompt: string,
  options: VideoGenerationOptions
): Promise<GeneratedVideo> {
  // Nano Banana API integration
  const apiKey = process.env.NEXT_PUBLIC_NANO_BANANA_API_KEY;

  if (!apiKey) {
    console.warn("Nano Banana API key not found, using mock video");
    return generateMockVideo(repo, prompt);
  }

  // Note: This is a hypothetical API structure
  // Replace with actual Nano Banana API when available
  const response = await fetch("https://api.nanobananavideo.com/v1/generate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      duration: options.duration,
      aspect_ratio: options.aspectRatio,
      quality: options.quality,
    }),
  });

  if (!response.ok) {
    throw new Error(`Nano Banana API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    url: data.video_url,
    thumbnailUrl: data.thumbnail_url || data.video_url,
    duration: options.duration || 15,
    prompt,
    status: "ready",
  };
}

/**
 * OpenAI Sora Integration
 */
async function generateWithSora(
  repo: Repository,
  prompt: string,
  options: VideoGenerationOptions
): Promise<GeneratedVideo> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OpenAI API key not found, using mock video");
    return generateMockVideo(repo, prompt);
  }

  // OpenAI Sora API (hypothetical structure)
  const response = await fetch("https://api.openai.com/v1/videos/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sora-2",
      prompt,
      size: options.aspectRatio === "9:16" ? "1080x1920" : "1920x1080",
    }),
  });

  if (!response.ok) {
    throw new Error(`Sora API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    url: data.data[0].url,
    thumbnailUrl: data.data[0].thumbnail_url,
    duration: options.duration || 15,
    prompt,
    status: "ready",
  };
}

/**
 * Google Veo Integration
 */
async function generateWithVeo(
  repo: Repository,
  prompt: string,
  options: VideoGenerationOptions
): Promise<GeneratedVideo> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_VEO_API_KEY;

  if (!apiKey) {
    console.warn("Google Veo API key not found, using mock video");
    return generateMockVideo(repo, prompt);
  }

  try {
    // Google Veo API endpoint (using Generative Language API)
    // Note: Veo may be accessed through Google AI Studio or Vertex AI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-001:generateVideo?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: {
            text: prompt,
          },
          videoConfig: {
            duration: options.duration || 15,
            aspectRatio: options.aspectRatio || "9:16",
            resolution: options.quality === "4k" ? "4K" : "1080p",
            includeAudio: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Veo API error: ${response.status} - ${errorText}`);
      throw new Error(`Veo API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle async video generation if needed
    if (data.status === "processing") {
      console.log("Veo video is processing, using mock for now");
      return generateMockVideo(repo, prompt);
    }

    return {
      id: data.videoId || data.id,
      url: data.videoUrl || data.url,
      thumbnailUrl: data.thumbnailUrl || data.videoUrl,
      duration: options.duration || 15,
      prompt,
      status: "ready",
    };
  } catch (error) {
    console.error("Error generating video with Veo:", error);
    return generateMockVideo(repo, prompt);
  }
}

/**
 * Generate mock video for development and fallback
 */
function generateMockVideo(repo: Repository, prompt: string): GeneratedVideo {
  // Use repository data to create unique mock videos
  const videoId = hashCode(repo.full_name).toString();

  // Use different video styles based on language
  const videoThemes: { [key: string]: string } = {
    JavaScript: "code-javascript",
    TypeScript: "code-typescript",
    Python: "code-python",
    Java: "code-java",
    Go: "code-go",
    Rust: "code-rust",
    Ruby: "code-ruby",
    "C++": "code-cpp",
    default: "code-generic",
  };

  const theme = videoThemes[repo.language || "default"] || videoThemes.default;

  // Create animated background video URLs (using placeholder video services)
  // In production, these would be actual generated AI videos
  const mockVideoUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
  const thumbnailUrl = `https://via.placeholder.com/1080x1920/000000/ffffff?text=${encodeURIComponent(
    repo.name
  )}`;

  return {
    id: videoId,
    url: mockVideoUrl,
    thumbnailUrl,
    duration: 15,
    prompt,
    status: "ready",
  };
}

/**
 * Simple hash function for consistent video selection
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Get video generation status
 */
export async function getVideoStatus(
  videoId: string,
  provider: VideoProvider
): Promise<GeneratedVideo | null> {
  // Check video generation status
  // This would poll the respective API
  return null;
}

/**
 * Batch generate videos for multiple repositories
 */
export async function batchGenerateVideos(
  repos: Repository[],
  options: VideoGenerationOptions = {}
): Promise<Map<string, GeneratedVideo>> {
  const videoMap = new Map<string, GeneratedVideo>();

  // Generate videos in parallel (with rate limiting in production)
  const promises = repos.map(async (repo) => {
    const video = await generateRepoVideo(repo, options);
    videoMap.set(repo.id.toString(), video);
  });

  await Promise.all(promises);

  return videoMap;
}
