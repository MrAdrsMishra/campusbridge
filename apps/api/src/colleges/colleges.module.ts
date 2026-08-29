import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { College, CollegeSchema, Category, CategorySchema } from './college.schema';
import { CollegesController } from './colleges.controller';
import { CollegesService } from './colleges.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: College.name, schema: CollegeSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [CollegesController],
  providers: [CollegesService],
})
export class CollegesModule {}
