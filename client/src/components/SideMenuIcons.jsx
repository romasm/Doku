import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { PlusIcon, GripVerticalIcon } from './icons';

export function useSideMenuIcons(containerRef) {
  const roots = useRef([]);

  useEffect(() => {
    const container = containerRef?.current || document.querySelector('.editor-blocknote');
    if (!container) return;

    function replaceIcons() {
      const menu = container.querySelector('.bn-side-menu');
      if (!menu) return;

      const buttons = menu.querySelectorAll('button');
      buttons.forEach((btn) => {
        if (btn.dataset.iconReplaced) return;
        btn.dataset.iconReplaced = 'true';

        // Hide original SVG
        const svg = btn.querySelector('svg');
        if (svg) svg.style.display = 'none';

        // Create a container for our icon
        const iconWrapper = document.createElement('span');
        iconWrapper.style.display = 'flex';
        iconWrapper.style.alignItems = 'center';
        btn.appendChild(iconWrapper);

        const root = createRoot(iconWrapper);
        const label = btn.getAttribute('aria-label');
        if (label === 'Add block') {
          root.render(<PlusIcon size={16} />);
        } else {
          root.render(<GripVerticalIcon size={16} />);
        }
        roots.current.push(root);
      });
    }

    const observer = new MutationObserver(replaceIcons);
    observer.observe(container, { childList: true, subtree: true });

    // Initial check
    replaceIcons();

    return () => {
      observer.disconnect();
      roots.current.forEach((r) => r.unmount());
      roots.current = [];
    };
  }, [containerRef]);
}
