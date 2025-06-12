export interface BannerText {
  subtitle: string;
  title: string;
  description: string;
  joinButton: string;
}

export interface ServersText {
  title: string;
  subtitle: string;
  loading: string;
  viewAllButton: string;
  fetchError: string;
}

export interface AdvantageCard {
  title: string;
  description: string;
  icon: string;
}

export interface AdvantageText {
  subtitle: string;
  title: string;
  description: string;
  cards: AdvantageCard[];
}

export interface AboutText {
  title: string;
  subtitle: string;
  card: {
    title: string;
    content: string;
    buttons: {
      history: string;
      cs2Official: string;
    };
    cs2OfficialUrl: string;
  };
}

export interface HistoryEvent {
  date: string;
  title: string;
  description: string;
}

export interface HistoryText {
  title: string;
  subtitle: string;
  yearMarkers: string[];
  events: HistoryEvent[];
}

export interface TextConfig {
  banner: BannerText;
  servers: ServersText;
  advantage: AdvantageText;
  about: AboutText;
  history: HistoryText;
}