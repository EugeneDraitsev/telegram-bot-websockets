export interface ChatPhoto {
  small_file_id: string;
  big_file_id: string;
}

export interface Chat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  all_members_are_administrators?: boolean;
  photo?: ChatPhoto;
  description?: string;
  invite_link?: string;
  pinned_message?: any;
  sticker_set_name?: string;
  can_set_sticker_set?: boolean;
}

export interface File {
  file_id: string;
  file_size: number;
  file_path: string;
}
