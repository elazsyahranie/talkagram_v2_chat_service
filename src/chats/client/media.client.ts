import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MediaClient {
  constructor(
    @Inject('MEDIA_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  async associateFilesWithChats(file_ids: string[], chat_id: string) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'associateFilesWithChats' },
        {
          file_ids,
          chat_id,
        },
      ),
    );
  }
}
