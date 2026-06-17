import {
  Target, Car, Home, Plane, Smartphone, Laptop, Camera, GraduationCap,
  Gift, Heart, Briefcase, Coffee, Music, ShoppingBag, Gem, Bike, Palmtree, Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const GOAL_ICONS: Record<string, LucideIcon> = {
  target: Target,
  car: Car,
  home: Home,
  plane: Plane,
  vacation: Palmtree,
  phone: Smartphone,
  laptop: Laptop,
  camera: Camera,
  education: GraduationCap,
  gift: Gift,
  wedding: Heart,
  work: Briefcase,
  coffee: Coffee,
  music: Music,
  shopping: ShoppingBag,
  jewelry: Gem,
  bike: Bike,
  rocket: Rocket,
};

export const GOAL_ICON_KEYS = Object.keys(GOAL_ICONS);

export function GoalIcon({ name, className = "size-6" }: { name?: string | null; className?: string }) {
  const Icon = (name && GOAL_ICONS[name]) || Target;
  return <Icon className={className} strokeWidth={2} />;
}
