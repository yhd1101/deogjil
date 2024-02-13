import { Injectable } from '@nestjs/common';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { ContentsService } from '../contents/contents.service';
import { TalkcontentsService } from '../talkcontents/talkcontents.service';
import { PageOptionsDto } from '../common/dtos/page-options.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly contentsService: ContentsService,
    private readonly talkcontentsService: TalkcontentsService,
  ) {}

  async search(
    pageOptionsDto: PageOptionsDto,
    searchQuery?: string,
    // tag?: string,
  ): Promise<any> {
    const [contentsResult, talkContentsResults] = await Promise.all([
      this.contentsService.contentGetAll(pageOptionsDto, searchQuery),
      this.talkcontentsService.talkContentGetAll(pageOptionsDto, searchQuery),
    ]);

    const combinedResult = {
      contents: contentsResult,
      talContents: talkContentsResults,
      metadata: {
        totalResults: contentsResult.meta + talkContentsResults.meta,
      },
    };

    return combinedResult;
  }
}
