import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: '协会简介', href: '#about' },
    { label: '活动动态', href: '#activities' },
    { label: '球队信息', href: '#teams' },
    { label: '赛事公告', href: '#matches' },
  ];

  const resourceLinks = [
    { label: '招新报名', href: 'https://mp.weixin.qq.com/s?__biz=MzkxMzIzOTQ4MA==&mid=2247489392&idx=1&sn=afe0b2d724f16bcb92a48a33a1a7b62d' },
    { label: '场地预约', href: '#' },
  ];

  const contactItems = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      label: '地址',
      value: '深圳市坪山区兰田路3002号',
    },
  ];

  const wechatInfo = {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
      </svg>
    ),
    label: '微信公众号',
    value: '请关注深圳技术大学足球协会官方公众号了解更多资讯',
    href: 'https://mp.weixin.qq.com/s?__biz=MzkxMzIzOTQ4MA==&mid=2247489392&idx=1&sn=afe0b2d724f16bcb92a48a33a1a7b62d',
  };

  /* ---------- helper: distinguish external vs internal links ---------- */
  const isExternal = (href: string) =>
    href.startsWith('http') || href.startsWith('//');

  const linkAttrs = (href: string) =>
    isExternal(href)
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {};

  return (
    <footer className="footer" role="contentinfo">
      <div className="footerContainer">
        <div className="footerTop">
          {/* 品牌区域 */}
          <div className="footerBrand">
            <div className="footerLogo">
              <img
                className="footerLogoIcon"
                src="/logo.jpg"
                alt="深圳技术大学足球协会标识"
              />
              <div className="footerLogoText">
                <span className="footerLogoTitle">SZTU足球协会</span>
                <span className="footerLogoSubtitle">Shenzhen Technology University · Football Association</span>
              </div>
            </div>
            <p className="footerDescription">
              深圳技术大学足球协会致力于推广校园足球文化，培养学生足球兴趣，
              提高足球竞技水平，为全校师生提供专业的足球赛事、训练和交流平台。
              每年主办「校长杯」等多项校园足球赛事。
            </p>
          </div>

          {/* 快速链接 + 资源中心 */}
          <div className="footerLinksGroup">
            <div className="footerSection">
              <h4 className="footerTitle">快速链接</h4>
              <nav className="footerLinks" aria-label="快速链接导航">
                {quickLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="footerLink"
                    {...linkAttrs(link.href)}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="footerSection">
              <h4 className="footerTitle">资源中心</h4>
              <nav className="footerLinks" aria-label="资源中心导航">
                {resourceLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="footerLink"
                    {...linkAttrs(link.href)}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* 联系我们 */}
          <div className="footerSection">
            <h4 className="footerTitle">联系我们</h4>
            <div className="contactInfo">
              {contactItems.map((item) => (
                <div key={item.label} className="contactItem">
                  <span className="contactIcon">{item.icon}</span>
                  <div className="contactText">
                    <span className="contactLabel">{item.label}</span>
                    <span className="contactValue">{item.value}</span>
                  </div>
                </div>
              ))}
              <a
                href={wechatInfo.href}
                className="contactItem contactItemLink"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="contactIcon">{wechatInfo.icon}</span>
                <div className="contactText">
                  <span className="contactLabel">{wechatInfo.label}</span>
                  <span className="contactValue">{wechatInfo.value}</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="footerBottom">
          <div className="footerLegal">
            <p className="copyright">
              &copy; {currentYear} 深圳技术大学足球协会. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
