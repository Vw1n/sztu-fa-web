import React from 'react';

interface SectionHeaderProps {
  tag: string;
  title: string;
  emphasis: string;
  description: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ tag, title, emphasis, description }) => (
  <div className="sectionHeader">
    <span className="sectionTag">{tag}</span>
    <div className="sectionTitleWrapper">
      <h2 className="sectionTitle">{title}<span>{emphasis}</span></h2>
      <p className="sectionDescription">{description}</p>
    </div>
  </div>
);
