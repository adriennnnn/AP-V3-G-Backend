import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ReferralMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Check for referral code in query parameters
    const referralCode = req.query.ref as string;
    
    if (referralCode) {
      // Set referral cookie for 30 days
      res.cookie('referral_code', referralCode, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }
    
    next();
  }
}
