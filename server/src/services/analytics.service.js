import Dataset from '../models/Dataset.js';
import { DatasetDownload } from '../models/DatasetDownload.js';
import { Discussion } from '../models/Discussion.js';

export const getPlatformStats = async () => {
  const [totalDatasets, totalDownloads, totalDiscussions] = await Promise.all([
    Dataset.countDocuments(),
    DatasetDownload.countDocuments(),
    Discussion.countDocuments(),
  ]);

  return {
    totalDatasets,
    totalDownloads,
    totalDiscussions,
  };
};

export const getDatasetEngagement = async (datasetId) => {
  const downloads = await DatasetDownload.countDocuments({ dataset: datasetId });
  const discussions = await Discussion.countDocuments({ dataset: datasetId });
  
  // Example of finding daily download trends for the last 7 days
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const downloadTrend = await DatasetDownload.aggregate([
    { $match: { dataset: datasetId, createdAt: { $gte: lastWeek } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  return {
    totalDownloads: downloads,
    totalDiscussions: discussions,
    trend: downloadTrend
  };
};