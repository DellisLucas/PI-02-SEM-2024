import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async create(username: string, email: string, password: string): Promise<User> {
    const existingUser = await this.userModel.findOne({ 
      $or: [{ username }, { email }] 
    }).exec();

    if (existingUser) {
      throw new ConflictException('Username ou email já existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
      expenses: [],
      incomes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return newUser.save();
  }

  async login(email: string, password: string): Promise<User | null> {
    // Troque para 'username' se for o campo correto
    const user = await this.userModel.collection.findOne({ email });
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    return this.userModel.findById(user._id);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.userModel.collection.findOne({ _id: new Types.ObjectId(id) });
    return result ? this.userModel.findById(result._id) : null;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string): Promise<User | null> {
    const result = await this.userModel.collection.findOneAndDelete({ _id: new Types.ObjectId(id) });
    return result ? this.userModel.findById(result._id) : null;
  }

  async searchUsers(query: string): Promise<User[]> {
    const results = await this.userModel.collection.find({
      username: { $regex: query, $options: 'i' }
    }).project({ password: 0 }).toArray();
    return Promise.all(results.map(r => this.userModel.findById(r._id)));
  }

  async getUsersStats(): Promise<any> {
    return this.userModel.collection.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [
                { $gt: ['$lastLogin', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalUsers: 1,
          activeUsers: 1
        }
      }
    ]).toArray();
  }

  async updateLastLogin(id: string): Promise<User | null> {
    const result = await this.userModel.collection.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { 
        $set: { 
          lastLogin: new Date(),
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    return result ? this.userModel.findById(result._id) : null;
  }
}
