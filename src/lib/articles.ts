// Article data for Informasi & Maintenance sections.
// Thumbnails reference local generated images.
import thumbSoftware from "@/assets/thumb-software.jpg";
import thumbHardware from "@/assets/thumb-hardware.jpg";
import thumbStorage from "@/assets/thumb-storage.jpg";
import thumbBattery from "@/assets/thumb-battery.jpg";
import thumbLcd from "@/assets/thumb-lcd.jpg";
import thumbKeyboard from "@/assets/thumb-keyboard.jpg";
import thumbCpu from "@/assets/thumb-cpu.jpg";
import thumbNetwork from "@/assets/thumb-network.jpg";
import thumbMacbook from "@/assets/thumb-macbook.jpg";

export const THUMBS = {
  software: thumbSoftware,
  hardware: thumbHardware,
  storage: thumbStorage,
  battery: thumbBattery,
  lcd: thumbLcd,
  keyboard: thumbKeyboard,
  cpu: thumbCpu,
  network: thumbNetwork,
  macbook: thumbMacbook,
} as const;

export type ThumbKey = keyof typeof THUMBS;

export type ArticleSection = "informasi" | "maintenance";
export type ArticleKind = "software" | "hardware";

export interface ArticleBlock {
  heading?: string;
  body: string;
}

export interface Article {
  slug: string;
  section: ArticleSection;
  kind: ArticleKind;
  title: string;
  summary: string;
  thumb: ThumbKey;
  author: string;
  date: string; // ISO
  readMinutes: number;
  tags: string[];
  blocks: ArticleBlock[];
}

const A = (a: Article) => a;

export const ARTICLES: Article[] = [];

export const informasi = ARTICLES.filter((a) => a.section === "informasi");
export const maintenance = ARTICLES.filter((a) => a.section === "maintenance");

export function findArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function relatedArticles(article: Article, count = 3): Article[] {
  return ARTICLES.filter(
    (a) => a.slug !== article.slug && (a.section === article.section || a.kind === article.kind),
  ).slice(0, count);
}
