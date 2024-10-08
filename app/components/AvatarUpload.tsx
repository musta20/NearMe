import { useState, useRef, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { toast } from "~/hooks/use-toast";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  user: any;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, user, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    fetcher.submit(formData, {
      method: "post",
      action: "/api/upload-avatar",
      encType: "multipart/form-data",
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(()=>{
    if (fetcher.data?.success) {
        onAvatarUpdate(fetcher.data.avatarUrl);
        toast({
          title: "Avatar updated",
          description: "Your avatar has been successfully updated.",
        });
        setIsUploading(false);
      } else if (fetcher.data?.error) {
        toast({
          title: "Upload failed",
          description: fetcher.data.error,
          variant: "destructive",
        });
        setIsUploading(false);
      }
    
  },[fetcher.data])


  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="w-20 h-20">
      {user?.avatarImage ? <AvatarImage src={user?.avatarImage} alt={user.username} />:
            <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
        }
        {/* <AvatarImage src={currentAvatarUrl} alt={user.username} />
        <AvatarFallback>{getInitials(user.username)}</AvatarFallback> */}
      </Avatar>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="avatar-upload"
          ref={fileInputRef}
          disabled={isUploading}
        />
        <Button
          variant="outline"
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Change Avatar"}
        </Button>
      </div>
    </div>
  );
}