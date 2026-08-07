import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Counselor, CounselorDocument } from './counselor.schema';

@Injectable()
export class CounselorsService implements OnModuleInit {
  constructor(@InjectModel(Counselor.name) private readonly counselors: Model<CounselorDocument>) {}
  async onModuleInit() {
    if (await this.counselors.countDocuments()) return;
    await this.counselors.insertMany([
      { name: 'Priya Sharma', email: 'priya@campusbridge.in', phone: '+919999999901', passwordHash: 'SET_PASSWORD_WITH_AUTH_SETUP', specializations: ['Engineering', 'MBA'] },
      { name: 'Arjun Mehta', email: 'arjun@campusbridge.in', phone: '+919999999902', passwordHash: 'SET_PASSWORD_WITH_AUTH_SETUP', specializations: ['Design', 'Commerce'] },
    ]);
  }
  findAll() { return this.counselors.find({ active: true }).sort({ name: 1 }).lean(); }
}
