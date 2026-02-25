import { Request, Response } from "express";

export const controllers = {
  free: async (_: Request, res: Response) => {
    try {
      const trendingTokens = [
        {
          name: "Trump",
          address: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
        },
      ];
      return res.status(201).json({
        success: true,
        tokens: trendingTokens,
      });
    } catch (error) {
      throw error;
    }
  },
  premium: async (_: Request, res: Response) => {
    try {
      const trendingTokens = [
        {
          name: "Wif",
          address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        },
        {
          name: "Bonk",
          address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        },
      ];
      return res.status(201).json({
        success: true,
        tokens: trendingTokens,
      });
    } catch (error) {
      throw error;
    }
  },
};
