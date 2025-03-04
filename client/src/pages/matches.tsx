import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star } from "lucide-react";

export default function Matches() {
  const { user } = useAuth();

  const { data: matches, isLoading } = useQuery({
    queryKey: ["/api/matches"],
    enabled: !!user,
  });

  const { data: movies } = useQuery({
    queryKey: ["movies", matches],
    enabled: !!matches,
    queryFn: async () => {
      if (!matches) return [];
      return Promise.all(
        matches.map((match: any) => tmdb.getMovieDetails(match.tmdbId))
      );
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Matches</h1>
        {!movies?.length ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">
              No matches yet. Keep swiping!
            </p>
            <p className="text-sm text-muted-foreground">
              When you and your partner like the same movie, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {movies.map((movie) => (
              <Card key={movie.id} className="overflow-hidden group">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={tmdb.getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-xl mb-2">{movie.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">
                        <Star className="w-4 h-4 mr-1" />
                        {movie.vote_average.toFixed(1)}
                      </Badge>
                      <Badge variant="secondary">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(movie.release_date).getFullYear()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {movie.overview}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}