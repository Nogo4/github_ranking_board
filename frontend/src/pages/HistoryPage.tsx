import { useQuery } from "@tanstack/react-query";
import { Clock, Star, TrendingUp } from "lucide-react";
import { api } from "../lib/api";
import type { HistoryResponse } from "../types/api";

export default function HistoryPage() {
  const { data, isLoading } = useQuery<HistoryResponse>({
    queryKey: ["history"],
    queryFn: () => api.get<HistoryResponse>("/ranking/history"),
    refetchInterval: 30_000,
  });

  const timeline = data?.timeline ?? [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Historique</h1>
        <span className="refresh-hint">Top 10 — Mise à jour toutes les 30s</span>
      </div>

      {isLoading ? (
        <div className="timeline-skeleton">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="timeline-item skeleton" />
          ))}
        </div>
      ) : timeline.length === 0 ? (
        <div className="empty-state">
          <Clock size={40} className="icon-muted" />
          <p>Aucune validation pour le moment.</p>
        </div>
      ) : (
        <div className="timeline">
          {[...timeline].reverse().map((event, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-header">
                  <img
                    className="timeline-avatar"
                    src={`https://github.com/${event.pseudo}.png?size=32`}
                    alt={event.pseudo}
                    width={28}
                    height={28}
                  />
                  <span className="timeline-pseudo">{event.pseudo}</span>
                  <span className="timeline-flag">{event.flagName}</span>
                  <span className="timeline-points">
                    <Star size={12} />+{event.pointsEarned}
                  </span>
                  <span className="timeline-date">
                    <Clock size={11} />
                    {new Date(event.date).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="snapshot">
                  <TrendingUp size={13} className="icon-muted" />
                  <span className="snapshot-label">Classement à cet instant</span>
                  <div className="snapshot-list">
                    {event.rankingSnapshot.slice(0, 3).map((s) => (
                      <span key={s.userId} className="snapshot-entry">
                        #{s.rank} — {s.score} pts
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
