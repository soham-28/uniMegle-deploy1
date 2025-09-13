import { useState } from 'react';

const INTERESTS = [
  'Study Group', 'Casual Chat', 'Career Discussion', 'Technical Help',
  'Exam Prep', 'Project Collaboration', 'Language Exchange', 'Hobbies',
  'Sports', 'Music', 'Gaming', 'Movies', 'Books', 'Travel'
];

export default function InterestSelector({ onInterestsChange, selectedInterests = [] }) {
  const [interests, setInterests] = useState(selectedInterests);

  const toggleInterest = (interest) => {
    const newInterests = interests.includes(interest)
      ? interests.filter(i => i !== interest)
      : [...interests, interest];
    
    setInterests(newInterests);
    onInterestsChange(newInterests);
  };

  return (
    <div className="interest-selector">
      <h3>Select Your Interests</h3>
      <p>This helps us match you with like-minded students</p>
      <div className="interest-grid">
        {INTERESTS.map(interest => (
          <button
            key={interest}
            className={`interest-tag ${interests.includes(interest) ? 'selected' : ''}`}
            onClick={() => toggleInterest(interest)}
          >
            {interest}
          </button>
        ))}
      </div>
      <div className="interest-count">
        {interests.length} interests selected
      </div>
    </div>
  );
}


