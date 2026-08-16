import { Controller, Get } from "@nestjs/common";
import { GithubService } from "./github.service";

@Controller("github")
export class GithubController {
  constructor(private readonly github: GithubService) {}

  @Get("repos")
  repos() {
    return this.github.getRepos();
  }
}
