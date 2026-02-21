import { useQuery } from "@tanstack/react-query";
import { Medal, Star, ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import type { RankingEntry } from "../types/api";

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function RankingPage() {
  const { data: ranking = [], isLoading } = useQuery<RankingEntry[]>({
    queryKey: ["ranking"],
    queryFn: () => api.get<RankingEntry[]>("/ranking"),
    refetchInterval: 30_000,
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Classement</h1>
        <span className="refresh-hint">Mise à jour toutes les 30s</span>
      </div>

      {isLoading ? (
        <div className="ranking-skeleton">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="ranking-row skeleton" />
          ))}
        </div>
      ) : (
        <div className="ranking-list">
          {ranking.map((entry) => (
            <div
              key={entry.id}
              className={`ranking-row ${entry.rank <= 3 ? "ranking-row--podium" : ""}`}
            >
              <div className="ranking-rank">
                {entry.rank <= 3 ? (
                  <Medal
                    size={20}
                    style={{ color: MEDAL_COLORS[entry.rank - 1] }}
                  />
                ) : (
                  <span className="rank-number">{entry.rank}</span>
                )}
              </div>

              <img
                className="ranking-avatar"
                src={`https://github.com/${entry.pseudo}.png?size=40`}
                alt={entry.pseudo}
                width={36}
                height={36}
              />

              <div className="ranking-info">
                <span className="ranking-pseudo">{entry.pseudo}</span>
                <div className="ranking-flags">
                  {entry.flagsValidated.slice(0, 5).map((f) => (
                    <span key={f.flagId} className="flag-pill">
                      {f.name}
                    </span>
                  ))}
                  {entry.flagsValidated.length > 5 && (
                    <span className="flag-pill flag-pill--more">
                      <ChevronRight size={11} />
                      {entry.flagsValidated.length - 5}
                    </span>
                  )}
                </div>
              </div>

              <div className="ranking-score">
                <Star size={14} className="icon-gold" />
                <span>{entry.score}</span>
              </div>
            </div>
          ))}

          {ranking.length === 0 && (
            <div className="empty-state">
              <Medal size={40} className="icon-muted" />
              <p>Aucun participant pour l'instant.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
