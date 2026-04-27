import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import got from 'got';

@Injectable()
export class DingtalkService {
  private accessToken: string;
  private expireAt: number;
  private readonly logger = new Logger(DingtalkService.name);

  constructor(private configService: ConfigService) {}

  private get appKey(): string {
    return this.configService.get<string>('DINGTALK_APP_KEY') || '';
  }

  private get appSecret(): string {
    return this.configService.get<string>('DINGTALK_APP_SECRET') || '';
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expireAt) {
      return this.accessToken;
    }

    const url = 'https://api.dingtalk.com/v1.0/oauth2/accessToken';
    const response = await got.post(url, {
      json: {
        appKey: this.appKey,
        appSecret: this.appSecret,
      },
    }).json<{ accessToken: string; expireIn: number }>();

    this.accessToken = response.accessToken;
    this.expireAt = Date.now() + (response.expireIn - 300) * 1000;
    this.logger.log('Dingtalk access token refreshed');
    return this.accessToken;
  }

  async getUserInfo(authCode: string): Promise<{ userId: string; unionId?: string }> {
    const token = await this.getAccessToken();
    const response = await got.post(
      'https://api.dingtalk.com/v1.0/oauth2/userAccessToken',
      {
        json: {
          tmpAuthCode: authCode,
        },
        headers: { 'x-acs-dingtalk-access-token': token },
      },
    ).json<{ userId: string; unionId?: string }>();

    return { userId: response.userId, unionId: response.unionId };
  }

  async getUserDetail(userId: string): Promise<{
    name: string;
    avatar?: string;
    mobile?: string;
    email?: string;
    departmentId?: number;
    departmentName?: string;
  }> {
    const token = await this.getAccessToken();
    const response = await got.get(
      `https://api.dingtalk.com/v1.0/contact/users/${userId}`,
      {
        headers: { 'x-acs-dingtalk-access-token': token },
      },
    ).json<any>();

    return {
      name: response.name || '',
      avatar: response.avatar,
      mobile: response.mobile,
      email: response.email,
      departmentId: response.departmentId,
      departmentName: response.departmentName,
    };
  }

  async getAttendanceRecords(
    userIds: string[],
    fromDate: string,
    toDate: string,
  ): Promise<any[]> {
    const token = await this.getAccessToken();
    const response = await got.post(
      'https://api.dingtalk.com/v1.0/attendance/listRecord',
      {
        json: {
          userIds,
          fromDate,
          toDate,
        },
        headers: { 'x-acs-dingtalk-access-token': token },
      },
    ).json<any>();

    return response.records || [];
  }

  async createApprovalInstance(
    processCode: string,
    originatorUserId: string,
    deptId: number,
    approvers: string,
    formComponentValues: Array<{ name: string; value: string }>,
  ): Promise<{ processInstanceId: string }> {
    const token = await this.getAccessToken();
    const response = await got.post(
      'https://api.dingtalk.com/v1.0/workflow/processInstances',
      {
        json: {
          processCode,
          originatorUserId,
          deptId,
          approvers,
          formComponentValues,
        },
        headers: { 'x-acs-dingtalk-access-token': token },
      },
    ).json<{ processInstanceId: string }>();

    return { processInstanceId: response.processInstanceId };
  }

  async getApprovalInstance(processInstanceId: string): Promise<any> {
    const token = await this.getAccessToken();
    const response = await got.get(
      `https://api.dingtalk.com/v1.0/workflow/processInstances/${processInstanceId}`,
      {
        headers: { 'x-acs-dingtalk-access-token': token },
      },
    ).json<any>();

    return response;
  }

  async sendWorkNotice(
    userId: string,
    msgContent: { type: string; content: string },
  ): Promise<void> {
    const token = await this.getAccessToken();
    await got.post(
      'https://api.dingtalk.com/v1.0/im/messages',
      {
        json: {
          userIds: [userId],
          msgType: msgContent.type,
          content: msgContent.content,
        },
        headers: { 'x-acs-dingtalk-access-token': token },
      },
    );
  }

  async getDepartmentList(parentId: number = 0): Promise<any[]> {
    const token = await this.getAccessToken();
    const response = await got.post(
      'https://api.dingtalk.com/v1.0/contact/departments/search',
      {
        json: { parentId },
        headers: { 'x-acs-dingtalk-access-token': token },
      },
    ).json<any>();

    return response.depts || [];
  }

  async getDepartmentUsers(deptId: number): Promise<any[]> {
    const token = await this.getAccessToken();
    const response = await got.post(
      'https://api.dingtalk.com/v1.0/contact/users/search',
      {
        json: { deptId, containAccessibleDepartment: true },
        headers: { 'x-acs-dingtalk-access-token': token },
      },
    ).json<any>();

    return response.list || [];
  }

  verifyCallbackSignature(
    timestamp: string,
    nonce: string,
    signature: string,
  ): boolean {
    const crypto = require('crypto');
    const computed = crypto
      .createHmac('sha256', this.appSecret)
      .update(`${timestamp}\n${nonce}`)
      .digest('base64');

    return computed === signature;
  }
}