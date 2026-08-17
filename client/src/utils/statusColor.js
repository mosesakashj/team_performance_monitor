export function statusColor(status) {
  switch (status) {
    case 'active':
      return 'green';
    case 'proposed':
      return 'brand';
    case 'on_hold':
      return 'amber';
    case 'completed':
      return 'slate';
    default:
      return 'slate';
  }
}
