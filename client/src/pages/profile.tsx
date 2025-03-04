import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navbar } from "@/components/navbar";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Thriller"
];

const PLATFORMS = [
  "Netflix", "Amazon Prime", "Disney+", "Hulu",
  "HBO Max", "Apple TV+", "Peacock"
];

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    user?.preferences?.genres || []
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    user?.preferences?.platforms || []
  );

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const res = await apiRequest("PATCH", "/api/user/preferences", preferences);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Preferences Updated",
        description: "Your movie preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update preferences. Please try again.",
      });
    },
  });

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate({
      genres: selectedGenres,
      platforms: selectedPlatforms,
    });
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Username</h3>
                  <p className="text-muted-foreground">{user.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movie Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Movie Preferences</CardTitle>
              <CardDescription>Select your favorite genres and streaming platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Favorite Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(genre => (
                    <Badge
                      key={genre}
                      variant={selectedGenres.includes(genre) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Streaming Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(platform => (
                    <Badge
                      key={platform}
                      variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => togglePlatform(platform)}
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSavePreferences}
                disabled={updatePreferencesMutation.isPending}
              >
                {updatePreferencesMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
