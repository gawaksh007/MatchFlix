import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MovieCard } from "@/components/movie-card";
import { tmdb } from "@/lib/tmdb";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/navbar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { AmbientMusic } from "@/components/ambient-music";
import { MoodToggle } from "@/components/mood-toggle";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Swipe() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateMode, setDateMode] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: movies, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/movies/discover", currentPage],
    queryFn: () => tmdb.getMovies(currentPage),
    retry: 2,
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ movieId, liked }: { movieId: number; liked: boolean }) => {
      const res = await apiRequest("POST", "/api/movies/swipe", {
        tmdbId: movieId,
        liked,
      });
      return res.json();
    },
    onSuccess: async (data) => {
      if (data.match) {
        toast({
          title: "It's a Match! 🎉",
          description: `You both liked "${data.movieTitle}"!`,
          duration: 5000,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your choice. Please try again.",
      });
    },
  });

  const handleSwipe = (liked: boolean) => {
    if (!movies?.length || !user) return;

    const movie = movies[currentIndex];
    swipeMutation.mutate({ movieId: movie.id, liked });

    if (currentIndex >= movies.length - 3) {
      setCurrentPage(prev => prev + 1);
    }
    setCurrentIndex(prev => prev + 1);
  };

  // Ambient background particles with mood-based colors
  const particles = Array.from({ length: 20 }).map((_, i) => (
    <motion.div
      key={i}
      className={cn(
        "absolute w-2 h-2 rounded-full",
        dateMode ? "bg-rose-500/20" : "bg-primary/20"
      )}
      animate={{
        x: ["0vw", `${Math.random() * 100}vw`],
        y: ["0vh", `${Math.random() * 100}vh`],
        scale: [1, Math.random() * 2 + 1],
        opacity: [0, 0.5, 0],
      }}
      transition={{
        duration: Math.random() * 10 + 10,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
      }}
    />
  ));

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 text-center">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">Failed to load movies</p>
          <button 
            onClick={() => refetch()} 
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24">
          <Skeleton className="w-full max-w-md mx-auto aspect-[2/3] rounded-lg" />
        </div>
      </div>
    );
  }

  if (!movies?.length) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 text-center">
          <h2 className="text-2xl font-bold">No more movies!</h2>
          <p className="text-muted-foreground">Check back later for more recommendations</p>
          <button 
            onClick={() => {
              setCurrentPage(1);
              setCurrentIndex(0);
              refetch();
            }} 
            className="mt-4 text-primary hover:underline"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen overflow-hidden relative",
      dateMode ? "bg-rose-950" : "bg-background"
    )}>
      {particles}
      <div className={cn(
        "fixed inset-0 pointer-events-none",
        dateMode 
          ? "bg-gradient-to-b from-rose-900/50 to-rose-950" 
          : "bg-gradient-to-b from-background/50 to-background"
      )} />

      <div className="fixed top-4 right-4 z-50">
        <MoodToggle onToggle={setDateMode} />
      </div>

      <Navbar />
      <div className="container pt-24 px-4 relative">
        <div className="relative max-w-md mx-auto h-[70vh]">
          <MovieCard
            movie={movies[currentIndex]}
            onSwipe={handleSwipe}
          />
        </div>
      </div>
      <AmbientMusic mood={dateMode ? "date" : "default"} />
    </div>
  );
}