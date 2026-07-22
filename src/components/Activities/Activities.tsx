import './Activities.css';
import { SectionHeader } from '../common';
import { useActivities } from './hooks/useActivities';

const Activities: React.FC = () => {
  const { displayList, currentPage, totalPages, setCurrentPage, isLoading } = useActivities();

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    document.getElementById('activities')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="activities" id="activities">
      <div className="activitiesContainer">
        <SectionHeader
          tag="活动动态"
          title="最新"
          emphasis="活动资讯"
          description="了解协会最新活动动态，参与丰富多彩的足球活动"
        />

        <div className="activitiesGrid">
          {displayList.map((activity, index) => (
            <div key={activity.id} className="activityCard">
              <div className="activityImageWrapper">
                <img src={activity.image} alt={activity.title} className="activityImage" loading="lazy" />
                <span className="activityCategory">{activity.category}</span>
                {currentPage === 1 && index === 0 && <span className="activityLatestBadge">最新发布</span>}
              </div>
              <div className="activityContent">
                <div className="activityDate">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {activity.date}
                </div>
                <h3 className="activityTitle">{activity.title}</h3>
                <p className="activityDescription">{activity.description}</p>
                <div className="activityMeta">
                  <div className="activityLocation">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {activity.location}
                  </div>
                  <a
                    href={activity.wechatUrl}
                    target={activity.wechatUrl === '#' ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="activityLink"
                  >
                    查看详情
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="activitiesPagination" aria-label="活动资讯分页">
            <button
              type="button"
              className="paginationButton paginationDirection"
              disabled={currentPage === 1 || isLoading}
              onClick={() => changePage(currentPage - 1)}
            >
              上一页
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                type="button"
                key={page}
                className={`paginationButton${page === currentPage ? ' active' : ''}`}
                aria-current={page === currentPage ? 'page' : undefined}
                disabled={isLoading}
                onClick={() => changePage(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="paginationButton paginationDirection"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => changePage(currentPage + 1)}
            >
              下一页
            </button>
          </nav>
        )}
      </div>
    </section>
  );
};

export default Activities;
