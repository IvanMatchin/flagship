import {
  ReviewTypes
} from '@brandingbrand/fscommerce';

interface ReviewRollup {
  average_rating: number;
  review_count: number;
  recommended_ratio: number;
  rating_histogram: number[];
  name?: string;
  properties: {
    key: string;
    name: string;
    values: ReviewTypes.ReviewDistribution[];
  }[];
}

interface ReviewDetails {
  page_id: string;
  reviews: ReviewItem[];
  statistics: ReviewTypes.ReviewStatistics;
  rollup: ReviewRollup;
}

interface ReviewItem {
  badges: {
    is_staff_reviewer: boolean;
    is_verified_buyer: boolean;
    is_verified_reviewer: boolean;
  };
  details: {
    brand_base_url: string;
    brand_logo_uri: string;
    headline: string;
    comments: string;
    location: string;
    nickname: string;
    created_date: number;
    bottom_line: string;
    properties: ReviewTypes.ReviewContext[];
  };
  metrics: {
    rating: number;
  };
}

interface ReviewSummaryItem {
  page_id: string;
  rollup: {
    average_rating: number;
    review_count: number;
  };
}

function reviewDetails(prResult: ReviewDetails): ReviewTypes.ReviewDetails {
  return {
    id: prResult.page_id,
    reviews: prResult.reviews.map(review),
    statistics: reviewStatistics(prResult),
    name: prResult.rollup.name
  };
}

function review(prReview: ReviewItem): ReviewTypes.Review {
  const { brand_base_url, brand_logo_uri } = prReview.details;
  const reviewedAtLogo = brand_base_url && brand_logo_uri
                          ? [brand_base_url, brand_logo_uri].join('')
                          : undefined;

  return {
    title: prReview.details.headline,
    text: prReview.details.comments,
    rating: prReview.metrics.rating,
    user: {
      isStaffReviewer: prReview.badges.is_staff_reviewer,
      isVerifiedBuyer: prReview.badges.is_verified_buyer,
      isVerifiedReviewer: prReview.badges.is_verified_reviewer,
      location: prReview.details.location,
      name: prReview.details.nickname
    },
    created: prReview.details.created_date,
    context: prReview.details.properties.map(property => {
      return {
        id: property.id,
        label: property.label,
        value: property.value
      };
    }),
    photos: [],  // TODO: Parse photos from PR (need example)
    bottomLine: prReview.details.bottom_line,
    reviewedAtLogo
  };
}

function reviewSummary(prResult: ReviewSummaryItem): ReviewTypes.ReviewSummary {
  return {
    id: prResult.page_id,
    averageRating: prResult.rollup.average_rating,
    reviewCount: prResult.rollup.review_count
  };
}

function reviewStatistics(prResult: ReviewDetails): ReviewTypes.ReviewStatistics {
  const rollup = prResult.rollup;
  return {
    id: prResult.page_id,
    averageRating: rollup.average_rating,
    reviewCount: rollup.review_count,
    recommendedRatio: rollup.recommended_ratio,
    ratingDistribution: rollup.rating_histogram.map((count: number, key: number) => {
      return {
        value: key + 1,
        count
      };
    }),
    contextDistributions: rollup.properties.map(property => {
      return {
        id: property.key,
        label: property.name,
        values: property.values.map(value => {
          return {
            value: value.value,
            count: value.count
          };
        })
      };
    })
  };
}

export default {
  reviewDetails,
  reviewSummary,
  reviewStatistics
};
