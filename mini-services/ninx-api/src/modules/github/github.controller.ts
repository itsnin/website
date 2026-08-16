// ============================================================================
// github.controller.ts — exposes the owner's GitHub repos.
// ==========================================================================
import { Controller, Get } from "@nestjs/common";
import { GithubService } from "./github.service";

@Controller("github")
export class GithubController {
  constructor(private readonly github: GithubService) {}

  // GET /github/repos — returns the owner's repos, sorted by stars.
  @Get("repos")
  repos() {
    return this.github.getRepos();
  }
}
