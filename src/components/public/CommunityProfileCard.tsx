import Link from "next/link";
import Image from "next/image";

interface CommunityProfileCardProps {
  slug: string;
  name: string;
  role: string;
  title?: string | null;
  image?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  TEAM_MEMBER: "Team Member",
  ADVISORY_BOARD: "Advisory Board",
  FELLOW: "Fellow",
  PRESENTER: "Presenter",
  DISCUSSANT: "Discussant",
};

export function CommunityProfileCard({
  slug,
  name,
  role,
  title,
  image,
  linkedin,
  twitter,
}: CommunityProfileCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <Link href={`/community/${slug}`}>
        <div className="relative h-24 w-24 overflow-hidden rounded-full bg-stone-100">
          {image ? (
            <Image src={image} alt={name} fill className="object-cover" sizes="96px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-stone-200 text-2xl font-semibold text-stone-500">
              {name[0]}
            </div>
          )}
        </div>
      </Link>
      <Link href={`/community/${slug}`} className="mt-3 font-semibold text-stone-900 hover:underline">
        {name}
      </Link>
      <p className="text-xs text-stone-500 mt-0.5">{ROLE_LABELS[role] ?? role}</p>
      {title && <p className="text-xs text-stone-400 mt-0.5">{title}</p>}
      <div className="mt-2 flex gap-3">
        {linkedin && (
          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-stone-400 hover:text-stone-700">
            LinkedIn
          </a>
        )}
        {twitter && (
          <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-xs text-stone-400 hover:text-stone-700">
            Twitter
          </a>
        )}
      </div>
    </div>
  );
}
