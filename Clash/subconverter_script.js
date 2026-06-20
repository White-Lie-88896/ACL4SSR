function filter(config, profile) {
  // 确保配置和节点列表存在
  if (!config.proxies || !config['proxy-groups']) {
    return config;
  }

  // 1. 筛选出所有类型为 relay 的策略组
  const relayGroups = config['proxy-groups'].filter(g => g.type === 'relay');
  
  // 2. 遍历并转换为 Mihomo (Clash Meta) 的 dialer-proxy 机制
  for (const group of relayGroups) {
    if (!group.proxies || group.proxies.length < 2) continue;
    
    const entryGroupName = group.proxies[0];     // 中转入口组
    const secondProxyName = group.proxies[1];
    
    let landingNodes = [];
    const secondProxyGroup = config['proxy-groups'].find(g => g.name === secondProxyName);
    if (secondProxyGroup) {
      landingNodes = secondProxyGroup.proxies || [];
    } else {
      landingNodes = group.proxies.slice(1);
    }
    
    // 给落地节点打上 dialer-proxy 标签，指向入口组
    for (const nodeName of landingNodes) {
      const proxyNode = config.proxies.find(p => p.name === nodeName);
      if (proxyNode) {
        proxyNode['dialer-proxy'] = entryGroupName;
      }
    }
    
    // 将原 relay 组的类型修改为 select，直接装载落地节点
    group.type = 'select';
    group.proxies = landingNodes;
  }
  
  return config;
}
