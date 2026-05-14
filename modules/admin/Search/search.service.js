import Guide from "../models/guideModel.js";
import Tour from "../models/tourModel.js";

import Rider from "../../../"

export const searchService = async (query) => {

  const guides = await Guide.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { city: { $regex: query, $options: "i" } },
      { language: { $regex: query, $options: "i" } }
    ]
  })
    .select("name city language profileImage rating")
    .limit(5);

  const tours = await Tour.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { city: { $regex: query, $options: "i" } }
    ]
  })
    .select("title city price thumbnail")
    .limit(5);

  return {
    guides,
    tours
  };
};