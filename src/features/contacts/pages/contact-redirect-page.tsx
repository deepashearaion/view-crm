import { Navigate, useParams } from 'react-router-dom';

import { paths } from '@/routes/paths';

/** `/dashboard/contacts/:contactId` (notification links) → the list with that contact's sheet open. */
export default function ContactRedirectPage() {
  const { contactId = '' } = useParams();
  const target = contactId
    ? `${paths.contacts}?contact=${encodeURIComponent(contactId)}`
    : paths.contacts;
  return <Navigate to={target} replace />;
}
