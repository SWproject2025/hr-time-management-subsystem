import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimeMangmentModule } from './time-mangment/time-mangment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') ?? 'mongodb+srv://abdoelkomy:abdoelkomy@cluster0.vpwn1.mongodb.net/',
      }),
      inject: [ConfigService],
    }),
    TimeMangmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
