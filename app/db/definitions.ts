// export types
export type User  = {
    user_id: string;
    email: string;
    username: string;
    bio:string;
    name:string;
    location:string;
    password: string;
    phone_number?: string;
    oauth_provider?: string;
    oauth_id?: string;
  };
  
  export type Product = {
    product_id: string;
    title: string;
    primary_image_url?: string;
    address: string;
    latitude: number;
    longitude: number;
    price: number;
    // ... other properties
  };
  
  export type ProductImage = {
    image_id: string;
    product_id: string;
    image_url: string;
    order: number;
    is_primary: boolean;
  };
  
  export type Favorite = {
    favorite_id: string;
    user_id: string;
    product_id: string;
  };
  
  export type Message = {
    message_id: string;
    sender_id: string;
    receiver_id: string;
    product_id: string;
    content: string;
  };