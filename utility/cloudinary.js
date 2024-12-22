import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadMedia = async (file) => {
  const response = await cloudinary.uploader
    .upload(file, {
      resource_type: "auto",
    })
    .catch((error) => {
      console.log(`Error in uploading to cloudinary `);
      console.log(error);
    });
  return response;
};
export const deleteMediaFromCloudinary=async(publicId)=>{
    const response=await cloudinary.uploader.destroy(publicId).catch(error=>{
        console.log(`Error in deleting from cloudinary `);
        console.log(error);
    })
    return response;
}
export const deleteVideoFromCloudinary = async (publicId) => {
  const response = await cloudinary.uploader
    .destroy(publicId,{
        resource_type:'video'
    })
    .catch((error) => {
      console.log(`Error in deleting from cloudinary `);
      console.log(error);
    });
  return response;
};