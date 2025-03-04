import { motion, useMotionValue, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Movie, tmdb } from "@/lib/tmdb";
import { Star } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  onSwipe: (liked: boolean) => void;
}

export function MovieCard({ movie, onSwipe }: MovieCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) >= 500 || Math.abs(offset) >= 100) {
      onSwipe(offset > 0);
    }
  };

  const imageUrl = tmdb.getImageUrl(movie.poster_path);

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full cursor-grab active:cursor-grabbing"
    >
      <Card className="w-full aspect-[2/3] overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center relative"
          style={{ 
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundColor: 'rgb(15 23 42)',
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-2xl font-bold text-white mb-2">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                <Star className="w-4 h-4 mr-1" />
                {movie.vote_average.toFixed(1)}
              </Badge>
              <Badge variant="secondary">
                {new Date(movie.release_date).getFullYear()}
              </Badge>
            </div>
            <p className="text-sm text-gray-200 line-clamp-2">
              {movie.overview}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}