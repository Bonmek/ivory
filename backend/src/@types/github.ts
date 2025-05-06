export interface GitHubProfile {
    id: string;
    username: string;
    accessToken?: string;
    [key: string]: unknown;
  }
  
  export interface Repository {
    id: number;
    name: string;
    complete_name: string;
    description: string | null;
    private: boolean;
    html_url: string;
    updated_at: string;
    language: string | null;
    visibility: string;
    default_branch: string;
    owner: string;
  }
  