module.exports = [
"[project]/dashboard/src/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api
]);
const API_BASE = process.env.NEXT_PUBLIC_APP_URL || '';
async function fetchApi(endpoint, options = {}) {
    const { method = 'GET', body, token, headers: customHeaders } = options;
    const headers = {};
    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (!(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    // Merge custom headers
    if (customHeaders) {
        Object.assign(headers, customHeaders);
    }
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    if (!res.ok) {
        const errorMessage = data.error || `HTTP ${res.status}: ${res.statusText}`;
        const errorDetails = data.details ? `\nDetails: ${data.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
    }
    return data;
}
const api = {
    auth: {
        login: (email, password)=>fetchApi('/api/auth/login', {
                method: 'POST',
                body: {
                    email,
                    password
                }
            }),
        register: (email, password, name)=>fetchApi('/api/auth/register', {
                method: 'POST',
                body: {
                    email,
                    password,
                    name
                }
            })
    },
    plans: {
        list: ()=>fetchApi('/api/plans')
    },
    projects: {
        list: (token)=>fetchApi('/api/projects', {
                token
            }),
        create: (name, token)=>fetchApi('/api/projects', {
                method: 'POST',
                body: {
                    name
                },
                token
            }),
        update: (projectId, name, token)=>fetchApi(`/api/projects/${projectId}`, {
                method: 'PATCH',
                body: {
                    name
                },
                token
            }),
        delete: (projectId, token)=>fetchApi(`/api/projects/${projectId}`, {
                method: 'DELETE',
                token
            })
    },
    devices: {
        list: (projectId, token, params)=>fetchApi(`/api/devices?projectId=${projectId}${params?.platform ? `&platform=${params.platform}` : ''}${params?.startDate ? `&startDate=${params.startDate}` : ''}${params?.endDate ? `&endDate=${params.endDate}` : ''}${params?.search ? `&search=${encodeURIComponent(params.search)}` : ''}${params?.debugMode ? `&debugMode=${params.debugMode}` : ''}${params?.deviceCategory ? `&deviceCategory=${encodeURIComponent(params.deviceCategory)}` : ''}${params?.deviceBrand ? `&deviceBrand=${encodeURIComponent(params.deviceBrand)}` : ''}${params?.language ? `&language=${encodeURIComponent(params.language)}` : ''}${params?.page ? `&page=${params.page}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}${params?.sortBy ? `&sortBy=${params.sortBy}` : ''}${params?.sortOrder ? `&sortOrder=${params.sortOrder}` : ''}`, {
                token
            }),
        getNotes: (deviceId, token)=>fetchApi(`/api/devices/${deviceId}/notes`, {
                token
            }),
        addNote: (deviceId, content, token)=>fetchApi(`/api/devices/${deviceId}/notes`, {
                method: 'POST',
                body: {
                    content
                },
                token
            }),
        deleteNote: (deviceId, noteId, token)=>fetchApi(`/api/devices/${deviceId}/notes?noteId=${noteId}`, {
                method: 'DELETE',
                token
            }),
        updateTags: (deviceId, tags, token)=>fetchApi(`/api/devices/${deviceId}/tags`, {
                method: 'PATCH',
                body: {
                    tags
                },
                token
            }),
        compare: (deviceIds, token)=>fetchApi(`/api/devices/compare?ids=${deviceIds.join(',')}`, {
                token
            }),
        export: (projectId, format, token)=>fetch(`${API_BASE}/api/devices/export?projectId=${projectId}&format=${format}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then((res)=>{
                if (!res.ok) {
                    return res.json().then((data)=>{
                        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
                    });
                }
                return format === 'csv' ? res.text() : res.json();
            })
    },
    logs: {
        list: (projectId, token, params)=>fetchApi(`/api/logs?projectId=${projectId}${params?.deviceId ? `&deviceId=${params.deviceId}` : ''}${params?.level ? `&level=${params.level}` : ''}${params?.tag ? `&tag=${encodeURIComponent(params.tag)}` : ''}${params?.search ? `&search=${encodeURIComponent(params.search)}` : ''}${params?.screenName ? `&screenName=${encodeURIComponent(params.screenName)}` : ''}${params?.startDate ? `&startDate=${params.startDate}` : ''}${params?.endDate ? `&endDate=${params.endDate}` : ''}${params?.page ? `&page=${params.page}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}${params?.offset ? `&offset=${params.offset}` : ''}`, {
                token
            }),
        clear: (projectId, token, params)=>fetchApi(`/api/logs?projectId=${projectId}${params?.level ? `&level=${params.level}` : ''}${params?.olderThan ? `&olderThan=${params.olderThan}` : ''}`, {
                method: 'DELETE',
                token
            })
    },
    crashes: {
        list: (projectId, token, params)=>{
            const queryParams = new URLSearchParams({
                projectId
            });
            if (params?.platform) queryParams.append('platform', params.platform);
            if (params?.deviceId) queryParams.append('deviceId', params.deviceId);
            if (params?.search) queryParams.append('search', params.search);
            if (params?.startDate) queryParams.append('startDate', params.startDate);
            if (params?.endDate) queryParams.append('endDate', params.endDate);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
            return fetchApi(`/api/crashes?${queryParams.toString()}`, {
                token
            });
        }
    },
    traces: {
        list: (projectId, token, params)=>fetchApi(`/api/traces?projectId=${projectId}${params?.deviceId ? `&deviceId=${params.deviceId}` : ''}${params?.method ? `&method=${params.method}` : ''}${params?.screenName ? `&screenName=${params.screenName}` : ''}${params?.groupByDevice ? `&groupByDevice=true` : ''}${params?.page ? `&page=${params.page}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}${params?.offset ? `&offset=${params.offset}` : ''}`, {
                token
            }),
        clear: (projectId, token, deviceId)=>fetchApi(`/api/traces?projectId=${projectId}${deviceId ? `&deviceId=${deviceId}` : ''}`, {
                method: 'DELETE',
                token
            })
    },
    config: {
        list: (projectId, token)=>fetchApi(`/api/config?projectId=${projectId}`, {
                token
            }),
        create: (projectId, token, data)=>fetchApi('/api/config', {
                method: 'POST',
                body: {
                    projectId,
                    ...data
                },
                token
            }),
        update: (token, data)=>fetchApi('/api/config', {
                method: 'PUT',
                body: data,
                token
            }),
        delete: (configId, token)=>fetchApi(`/api/config?id=${configId}`, {
                method: 'DELETE',
                token
            })
    },
    sessions: {
        list: (projectId, token, params)=>fetchApi(`/api/sessions?projectId=${projectId}${params?.deviceId ? `&deviceId=${params.deviceId}` : ''}${params?.isActive ? `&isActive=${params.isActive}` : ''}${params?.page ? `&page=${params.page}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}${params?.sortBy ? `&sortBy=${params.sortBy}` : ''}${params?.sortOrder ? `&sortOrder=${params.sortOrder}` : ''}`, {
                token
            }),
        timeline: (sessionId, token)=>fetchApi(`/api/sessions/${sessionId}/timeline`, {
                token
            })
    },
    analytics: {
        get: (projectId, token, deviceId)=>fetchApi(`/api/analytics?projectId=${projectId}${deviceId ? `&deviceId=${deviceId}` : ''}`, {
                token
            })
    },
    flow: {
        get: (projectId, token, sessionId)=>fetchApi(`/api/flow?projectId=${projectId}${sessionId ? `&sessionId=${sessionId}` : ''}`, {
                token
            })
    },
    settings: {
        get: (projectId, token)=>fetchApi(`/api/settings?projectId=${projectId}`, {
                token
            }),
        update: (projectId, token, data)=>fetchApi('/api/settings', {
                method: 'PUT',
                body: {
                    projectId,
                    ...data
                },
                token
            })
    },
    featureFlags: {
        get: (projectId, token)=>fetchApi(`/api/feature-flags?projectId=${projectId}`, {
                token
            }),
        update: (projectId, token, flags)=>fetchApi('/api/feature-flags', {
                method: 'PUT',
                body: {
                    projectId,
                    flags
                },
                token
            })
    },
    alerts: {
        list: (projectId, token)=>fetchApi(`/api/alerts?projectId=${projectId}`, {
                token
            }),
        create: (projectId, token, data)=>fetchApi('/api/alerts', {
                method: 'POST',
                body: {
                    projectId,
                    ...data
                },
                token
            }),
        update: (token, data)=>fetchApi('/api/alerts', {
                method: 'PUT',
                body: data,
                token
            }),
        delete: (alertId, token)=>fetchApi(`/api/alerts?id=${alertId}`, {
                method: 'DELETE',
                token
            })
    },
    monitor: {
        list: (projectId, token, params)=>fetchApi(`/api/monitor?projectId=${projectId}${params?.alertId ? `&alertId=${params.alertId}` : ''}${params?.isResolved !== undefined ? `&isResolved=${params.isResolved}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}${params?.offset ? `&offset=${params.offset}` : ''}`, {
                token
            }),
        get: (projectId, errorId, token)=>fetchApi(`/api/monitor?projectId=${projectId}&errorId=${errorId}`, {
                token
            }),
        update: (token, data)=>fetchApi('/api/monitor', {
                method: 'PUT',
                body: data,
                token
            }),
        delete: (errorId, token)=>fetchApi(`/api/monitor?id=${errorId}`, {
                method: 'DELETE',
                token
            })
    },
    businessConfig: {
        list: (projectId, token, category)=>fetchApi(`/api/business-config?projectId=${projectId}${category ? `&category=${encodeURIComponent(category)}` : ''}`, {
                token
            }),
        create: (projectId, token, data)=>fetchApi('/api/business-config', {
                method: 'POST',
                body: {
                    projectId,
                    ...data
                },
                token
            }),
        update: (token, data)=>fetchApi('/api/business-config', {
                method: 'PUT',
                body: data,
                token
            }),
        delete: (configId, token)=>fetchApi(`/api/business-config?id=${configId}`, {
                method: 'DELETE',
                token
            }),
        // Change History
        getChanges: (projectId, configId, limit, token)=>fetchApi(`/api/business-config/changes?projectId=${projectId}${configId ? `&configId=${configId}` : ''}&limit=${limit}`, {
                token
            }),
        // Evaluate config with targeting
        evaluate: (configKey, context, apiKey)=>fetchApi('/api/business-config/evaluate', {
                method: 'POST',
                body: {
                    configKey,
                    context
                },
                headers: {
                    'X-API-Key': apiKey
                }
            }),
        // Analytics
        getAnalytics: (projectId, configKey, startDate, endDate, token)=>fetchApi(`/api/business-config/analytics?projectId=${projectId}${configKey ? `&configKey=${configKey}` : ''}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`, {
                token
            })
    },
    experiments: {
        list: (projectId, status, token)=>fetchApi(`/api/experiments?projectId=${projectId}${status ? `&status=${status}` : ''}`, {
                token
            }),
        get: (experimentId, token)=>fetchApi(`/api/experiments/${experimentId}`, {
                token
            }),
        create: (data, token)=>fetchApi('/api/experiments', {
                method: 'POST',
                body: data,
                token
            }),
        update: (experimentId, data, token)=>fetchApi(`/api/experiments/${experimentId}`, {
                method: 'PATCH',
                body: data,
                token
            }),
        delete: (experimentId, token)=>fetchApi(`/api/experiments/${experimentId}`, {
                method: 'DELETE',
                token
            }),
        getResults: (experimentId, token)=>fetchApi(`/api/experiments/${experimentId}/results`, {
                token
            }),
        assign: (experimentId, deviceId, userId, context, apiKey)=>fetchApi(`/api/experiments/${experimentId}/assign`, {
                method: 'POST',
                body: {
                    deviceId,
                    userId,
                    context
                },
                headers: {
                    'X-API-Key': apiKey
                }
            }),
        trackEvent: (experimentId, deviceId, userId, eventType, eventName, eventValue, metadata, apiKey)=>fetchApi(`/api/experiments/${experimentId}/events`, {
                method: 'POST',
                body: {
                    deviceId,
                    userId,
                    eventType,
                    eventName,
                    eventValue,
                    metadata
                },
                headers: {
                    'X-API-Key': apiKey
                }
            })
    },
    deployments: {
        deploy: (configId, strategy, config, token)=>fetchApi(`/api/business-config/${configId}/deploy`, {
                method: 'POST',
                body: {
                    strategy,
                    config
                },
                token
            }),
        rollback: (configId, reason, token)=>fetchApi(`/api/business-config/${configId}/deploy/rollback`, {
                method: 'POST',
                body: {
                    reason
                },
                token
            }),
        getDeployments: (configId, token)=>fetchApi(`/api/business-config/${configId}/deployments`, {
                token
            })
    },
    configAlerts: {
        list: (configId, token)=>fetchApi(`/api/business-config/${configId}/alerts`, {
                token
            }),
        create: (configId, data, token)=>fetchApi(`/api/business-config/${configId}/alerts`, {
                method: 'POST',
                body: data,
                token
            }),
        update: (configId, alertId, data, token)=>fetchApi(`/api/business-config/${configId}/alerts/${alertId}`, {
                method: 'PATCH',
                body: data,
                token
            }),
        delete: (configId, alertId, token)=>fetchApi(`/api/business-config/${configId}/alerts/${alertId}`, {
                method: 'DELETE',
                token
            }),
        getEvents: (configId, alertId, acknowledged, token)=>fetchApi(`/api/business-config/${configId}/alerts/${alertId}/events${acknowledged !== undefined ? `?acknowledged=${acknowledged}` : ''}`, {
                token
            }),
        acknowledgeEvent: (configId, alertId, eventId, token)=>fetchApi(`/api/business-config/${configId}/alerts/${alertId}/events/${eventId}`, {
                method: 'PATCH',
                token
            })
    },
    configApprovals: {
        list: (configId, token)=>fetchApi(`/api/business-config/${configId}/approvals`, {
                token
            }),
        create: (configId, data, token)=>fetchApi(`/api/business-config/${configId}/approvals`, {
                method: 'POST',
                body: data,
                token
            }),
        approve: (configId, approvalId, comment, token)=>fetchApi(`/api/business-config/${configId}/approvals/${approvalId}`, {
                method: 'PATCH',
                body: {
                    action: 'approve',
                    comment
                },
                token
            }),
        reject: (configId, approvalId, comment, token)=>fetchApi(`/api/business-config/${configId}/approvals/${approvalId}`, {
                method: 'PATCH',
                body: {
                    action: 'reject',
                    comment
                },
                token
            })
    },
    upload: {
        uploadFile: async (projectId, token, file)=>{
            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectId', projectId);
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }
            return data;
        },
        deleteFile: (fileId, token)=>fetchApi(`/api/upload?id=${fileId}`, {
                method: 'DELETE',
                token
            }),
        listFiles: (projectId, token)=>fetchApi(`/api/upload?projectId=${projectId}`, {
                token
            })
    },
    localization: {
        // Languages
        getLanguages: (projectId, token)=>fetchApi(`/api/localization/languages?projectId=${projectId}`, {
                token
            }),
        createLanguage: (projectId, token, data)=>fetchApi('/api/localization/languages', {
                method: 'POST',
                body: {
                    projectId,
                    ...data
                },
                token
            }),
        updateLanguage: (token, data)=>fetchApi('/api/localization/languages', {
                method: 'PUT',
                body: data,
                token
            }),
        deleteLanguage: (languageId, token)=>fetchApi(`/api/localization/languages?id=${languageId}`, {
                method: 'DELETE',
                token
            }),
        // Keys
        getKeys: (projectId, token, category)=>fetchApi(`/api/localization/keys?projectId=${projectId}${category ? `&category=${encodeURIComponent(category)}` : ''}`, {
                token
            }),
        createKey: (projectId, token, data)=>fetchApi('/api/localization/keys', {
                method: 'POST',
                body: {
                    projectId,
                    ...data
                },
                token
            }),
        updateKey: (token, data)=>fetchApi('/api/localization/keys', {
                method: 'PUT',
                body: data,
                token
            }),
        deleteKey: (keyId, token)=>fetchApi(`/api/localization/keys?id=${keyId}`, {
                method: 'DELETE',
                token
            }),
        // Translations
        getTranslations: (projectId, token, languageCode)=>fetchApi(`/api/localization/translations?projectId=${projectId}${languageCode ? `&lang=${languageCode}` : ''}`, {
                token
            }),
        saveTranslation: (token, data)=>fetchApi('/api/localization/translations', {
                method: 'POST',
                body: data,
                token
            }),
        updateTranslation: (token, data)=>fetchApi('/api/localization/translations', {
                method: 'POST',
                body: data,
                token
            }),
        bulkUpdateTranslations: (projectId, token, translations)=>fetchApi('/api/localization/translations', {
                method: 'PUT',
                body: {
                    projectId,
                    translations
                },
                token
            }),
        // Import/Export
        import: (projectId, token, file, options)=>{
            const formData = new FormData();
            formData.append('projectId', projectId);
            formData.append('format', options.format);
            formData.append('file', file);
            if (options.languageCode) {
                formData.append('languageCode', options.languageCode);
            }
            formData.append('options', JSON.stringify({
                createMissingKeys: options.createMissingKeys ?? true,
                updateExisting: options.updateExisting ?? true,
                dryRun: options.dryRun ?? false,
                category: options.category
            }));
            return fetchApi('/api/localization/import', {
                method: 'POST',
                body: formData,
                token,
                headers: {}
            });
        },
        export: (projectId, token, options)=>{
            const params = new URLSearchParams({
                projectId,
                format: options.format
            });
            if (options.languageCode) {
                params.append('languageCode', options.languageCode);
            }
            if (options.category) {
                params.append('category', options.category);
            }
            if (options.includeEmpty) {
                params.append('includeEmpty', 'true');
            }
            return fetch(`/api/localization/export?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(async (res)=>{
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || 'Export failed');
                }
                return res.blob();
            });
        },
        // Statistics
        getStatistics: (projectId, token)=>fetchApi(`/api/localization/statistics?projectId=${projectId}`, {
                token
            }),
        // Bulk Operations
        bulkEdit: (token, data)=>fetchApi('/api/localization/bulk', {
                method: 'PATCH',
                body: data,
                token
            }),
        // Machine Translation
        translate: (keyId, targetLanguageId, sourceLanguageId, provider, token)=>fetchApi('/api/localization/translate', {
                method: 'POST',
                body: {
                    keyId,
                    targetLanguageId,
                    sourceLanguageId,
                    provider
                },
                token
            }),
        // Translation Memory
        getTMSuggestions: (projectId, sourceLanguageId, targetLanguageId, sourceText, minSimilarity, token)=>fetchApi(`/api/localization/tm/suggestions?projectId=${projectId}&sourceLanguageId=${sourceLanguageId}&targetLanguageId=${targetLanguageId}&sourceText=${encodeURIComponent(sourceText)}&minSimilarity=${minSimilarity}`, {
                token
            }),
        // Comments
        getComments: (translationId, projectId, token)=>fetchApi(`/api/localization/comments?translationId=${translationId}&projectId=${projectId}`, {
                token
            }),
        createComment: (translationId, projectId, content, token)=>fetchApi('/api/localization/comments', {
                method: 'POST',
                body: {
                    translationId,
                    projectId,
                    content
                },
                token
            }),
        updateComment: (commentId, isResolved, token)=>fetchApi(`/api/localization/comments/${commentId}`, {
                method: 'PATCH',
                body: {
                    isResolved
                },
                token
            }),
        deleteComment: (commentId, token)=>fetchApi(`/api/localization/comments/${commentId}`, {
                method: 'DELETE',
                token
            }),
        // History
        getHistory: (projectId, translationId, keyId, limit, token)=>fetchApi(`/api/localization/history?projectId=${projectId}${translationId ? `&translationId=${translationId}` : ''}${keyId ? `&keyId=${keyId}` : ''}&limit=${limit}`, {
                token
            }),
        // Glossary
        getGlossary: (projectId, category, search, token)=>fetchApi(`/api/localization/glossary?projectId=${projectId}${category ? `&category=${category}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`, {
                token
            }),
        createGlossaryTerm: (projectId, term, definition, context, translations, category, token)=>fetchApi('/api/localization/glossary', {
                method: 'POST',
                body: {
                    projectId,
                    term,
                    definition,
                    context,
                    translations,
                    category
                },
                token
            }),
        updateGlossaryTerm: (termId, data, token)=>fetchApi(`/api/localization/glossary/${termId}`, {
                method: 'PUT',
                body: data,
                token
            }),
        deleteGlossaryTerm: (termId, token)=>fetchApi(`/api/localization/glossary/${termId}`, {
                method: 'DELETE',
                token
            }),
        // Translation Providers
        getProviders: (projectId, token)=>fetchApi(`/api/localization/providers?projectId=${projectId}`, {
                token
            }),
        createProvider: (projectId, provider, apiKey, apiSecret, isEnabled, autoTranslate, defaultSourceLanguageId, token)=>fetchApi('/api/localization/providers', {
                method: 'POST',
                body: {
                    projectId,
                    provider,
                    apiKey,
                    apiSecret,
                    isEnabled,
                    autoTranslate,
                    defaultSourceLanguageId
                },
                token
            }),
        // OTA Updates
        checkOTA: (projectId, currentVersion, languageCode, apiKey)=>fetchApi(`/api/localization/ota/check?projectId=${projectId}${currentVersion ? `&currentVersion=${currentVersion}` : ''}&languageCode=${languageCode}`, {
                headers: {
                    'X-API-Key': apiKey
                }
            }),
        logOTAUpdate: (projectId, deviceId, fromVersion, toVersion, languageCode, apiKey)=>fetchApi('/api/localization/ota/update', {
                method: 'POST',
                body: {
                    projectId,
                    deviceId,
                    fromVersion,
                    toVersion,
                    languageCode
                },
                headers: {
                    'X-API-Key': apiKey
                }
            })
    },
    subscription: {
        get: (token)=>fetchApi('/api/subscription', {
                token
            }),
        getUsage: (token)=>fetchApi('/api/subscription/usage', {
                token
            }),
        getHistory: (token)=>fetchApi('/api/subscription/history', {
                token
            }),
        upgrade: (planId, paymentMethodId, token)=>fetchApi('/api/subscription/upgrade', {
                method: 'POST',
                body: {
                    planId,
                    paymentMethodId
                },
                token
            }),
        confirmUpgrade: (paymentIntentId, planId, token)=>fetchApi('/api/subscription/confirm-upgrade', {
                method: 'POST',
                body: {
                    paymentIntentId,
                    planId
                },
                token
            }),
        update: (planName, token)=>fetchApi('/api/subscription', {
                method: 'PATCH',
                body: {
                    planName
                },
                token
            }),
        getEnforcement: (token)=>fetchApi('/api/subscription/enforcement', {
                token
            })
    },
    paymentMethods: {
        list: (token)=>fetchApi('/api/payment-methods', {
                token
            }),
        get: (id, token)=>fetchApi(`/api/payment-methods/${id}`, {
                token
            }),
        create: (paymentMethodId, isDefault, token)=>fetchApi('/api/payment-methods', {
                method: 'POST',
                body: {
                    paymentMethodId,
                    isDefault
                },
                token
            }),
        update: (id, updates, token)=>fetchApi(`/api/payment-methods/${id}`, {
                method: 'PATCH',
                body: updates,
                token
            }),
        delete: (id, token)=>fetchApi(`/api/payment-methods/${id}`, {
                method: 'DELETE',
                token
            })
    },
    admin: {
        getUsers: (token)=>fetchApi('/api/admin/users', {
                token
            }),
        getSubscriptions: (token)=>fetchApi('/api/admin/subscriptions', {
                token
            }),
        getStats: (token)=>fetchApi('/api/admin/stats', {
                token
            }),
        getRevenue: (token)=>fetchApi('/api/admin/revenue', {
                token
            }),
        getAnalytics: (token)=>fetchApi('/api/admin/analytics', {
                token
            }),
        // Offers Management
        getOffers: (token, params)=>{
            const query = params ? '?' + new URLSearchParams(params).toString() : '';
            return fetchApi(`/api/admin/offers${query}`, {
                token
            });
        },
        createOffers: (type, options, token)=>fetchApi('/api/admin/offers/create', {
                method: 'POST',
                body: {
                    type,
                    ...options
                },
                token
            }),
        acceptOffer: (offerId, token)=>fetchApi(`/api/admin/offers/${offerId}/accept`, {
                method: 'POST',
                token
            }),
        getForecast: (token)=>fetchApi('/api/admin/forecast', {
                token
            }),
        // Plan Management
        getPlans: (token)=>fetchApi('/api/admin/plans', {
                token
            }),
        getPlan: (planId, token)=>fetchApi(`/api/admin/plans/${planId}`, {
                token
            }),
        createPlan: (plan, token)=>fetchApi('/api/admin/plans', {
                method: 'POST',
                body: plan,
                token
            }),
        updatePlan: (planId, plan, token)=>fetchApi(`/api/admin/plans/${planId}`, {
                method: 'PATCH',
                body: plan,
                token
            }),
        deletePlan: (planId, token)=>fetchApi(`/api/admin/plans/${planId}`, {
                method: 'DELETE',
                token
            }),
        // Subscription Management
        getSubscription: (subscriptionId, token)=>fetchApi(`/api/admin/subscriptions/${subscriptionId}`, {
                token
            }),
        enableSubscription: (subscriptionId, token)=>fetchApi(`/api/admin/subscriptions/${subscriptionId}/enable`, {
                method: 'PATCH',
                token
            }),
        disableSubscription: (subscriptionId, token)=>fetchApi(`/api/admin/subscriptions/${subscriptionId}/disable`, {
                method: 'PATCH',
                token
            }),
        changeSubscriptionPlan: (subscriptionId, planId, token)=>fetchApi(`/api/admin/subscriptions/${subscriptionId}/plan`, {
                method: 'PATCH',
                body: {
                    planId
                },
                token
            }),
        updateSubscriptionStatus: (subscriptionId, status, token)=>fetchApi(`/api/admin/subscriptions/${subscriptionId}/status`, {
                method: 'PATCH',
                body: {
                    status
                },
                token
            }),
        updateSubscriptionQuotas: (subscriptionId, quotas, token)=>fetchApi(`/api/admin/subscriptions/${subscriptionId}/quotas`, {
                method: 'PATCH',
                body: quotas,
                token
            }),
        createSubscription: (data, token)=>fetchApi('/api/admin/subscriptions', {
                method: 'POST',
                body: data,
                token
            }),
        // Promo Code Management
        getPromoCodes: (token)=>fetchApi('/api/admin/promo-codes', {
                token
            }),
        createPromoCode: (data, token)=>fetchApi('/api/admin/promo-codes', {
                method: 'POST',
                body: data,
                token
            }),
        getPromoCode: (promoCodeId, token)=>fetchApi(`/api/admin/promo-codes/${promoCodeId}`, {
                token
            }),
        updatePromoCode: (promoCodeId, data, token)=>fetchApi(`/api/admin/promo-codes/${promoCodeId}`, {
                method: 'PATCH',
                body: data,
                token
            }),
        deletePromoCode: (promoCodeId, token)=>fetchApi(`/api/admin/promo-codes/${promoCodeId}`, {
                method: 'DELETE',
                token
            }),
        // Configuration Management
        getConfigurations: (token, category)=>fetchApi(`/api/admin/configurations${category ? `?category=${category}` : ''}`, {
                token
            }),
        getConfiguration: (category, key, token)=>fetchApi(`/api/admin/configurations/${category}/${key}`, {
                token
            }),
        saveConfiguration: (data, token)=>fetchApi('/api/admin/configurations', {
                method: 'POST',
                body: data,
                token
            }),
        deleteConfiguration: (category, key, token)=>fetchApi(`/api/admin/configurations/${category}/${key}`, {
                method: 'DELETE',
                token
            }),
        testConfiguration: (category, key, testType, testData, token)=>fetchApi('/api/admin/configurations/test', {
                method: 'POST',
                body: {
                    category,
                    key,
                    testType,
                    testData
                },
                token
            })
    },
    builds: {
        create: (projectId, token, data)=>fetchApi('/api/builds', {
                method: 'POST',
                body: {
                    projectId,
                    ...data
                },
                token
            }),
        list: (projectId, token, featureType)=>fetchApi(`/api/builds?projectId=${projectId}${featureType ? `&featureType=${featureType}` : ''}`, {
                token
            }),
        get: (buildId, token)=>fetchApi(`/api/builds/${buildId}`, {
                token
            }),
        update: (buildId, token, data)=>fetchApi(`/api/builds/${buildId}`, {
                method: 'PATCH',
                body: data,
                token
            }),
        delete: (buildId, token)=>fetchApi(`/api/builds/${buildId}`, {
                method: 'DELETE',
                token
            }),
        setMode: (buildId, mode, token)=>fetchApi(`/api/builds/${buildId}/mode`, {
                method: 'PATCH',
                body: {
                    mode
                },
                token
            }),
        getDiff: (buildId1, buildId2, token)=>fetchApi(`/api/builds/diff/${buildId1}/${buildId2}`, {
                token
            })
    },
    mocks: {
        listEnvironments: (projectId, token)=>fetchApi(`/api/mocks/environments?projectId=${projectId}`, {
                token
            }),
        createEnvironment: (projectId, token, data)=>fetchApi('/api/mocks/environments', {
                method: 'POST',
                body: {
                    projectId,
                    ...data
                },
                token
            }),
        updateEnvironment: (envId, token, data)=>fetchApi(`/api/mocks/environments/${envId}`, {
                method: 'PATCH',
                body: data,
                token
            }),
        listEndpoints: (environmentId, token)=>fetchApi(`/api/mocks/endpoints?environmentId=${environmentId}`, {
                token
            }),
        getEndpoint: (endpointId, token)=>fetchApi(`/api/mocks/endpoints/${endpointId}`, {
                token
            }),
        createEndpoint: (token, data)=>fetchApi('/api/mocks/endpoints', {
                method: 'POST',
                body: data,
                token
            }),
        deleteEndpoint: (endpointId, token)=>fetchApi(`/api/mocks/endpoints/${endpointId}`, {
                method: 'DELETE',
                token
            }),
        createResponse: (token, data)=>fetchApi('/api/mocks/responses', {
                method: 'POST',
                body: data,
                token
            }),
        updateResponse: (responseId, token, data)=>fetchApi(`/api/mocks/responses/${responseId}`, {
                method: 'PATCH',
                body: data,
                token
            }),
        deleteResponse: (responseId, token)=>fetchApi(`/api/mocks/responses/${responseId}`, {
                method: 'DELETE',
                token
            })
    }
};
}),
"[project]/dashboard/src/app/register/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RegisterPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$components$2f$AuthProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/components/AuthProvider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/src/lib/api.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function RegisterPage() {
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [freePlan, setFreePlan] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [planLoading, setPlanLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const { login } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$components$2f$AuthProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Fetch free plan
        fetch('/api/plans').then((res)=>res.json()).then((data)=>{
            if (data.plans) {
                const free = data.plans.find((p)=>p.name === 'free');
                setFreePlan(free || null);
            }
            setPlanLoading(false);
        }).catch(()=>{
            setPlanLoading(false);
        });
    }, []);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { user, token } = await __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].auth.register(email, password, name);
            login(token, user);
            router.push('/projects');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally{
            setLoading(false);
        }
    };
    // Helper function to format limit values
    const formatLimit = (value)=>{
        if (value === null || value === undefined) return 'Unlimited';
        return value.toLocaleString();
    };
    // Helper function to generate features list from plan data
    const generateFeatures = (plan)=>{
        if (!plan) return [];
        const features = [];
        // Limits/Meters
        if (plan.maxDevices !== null && plan.maxDevices !== undefined) {
            features.push({
                icon: '📱',
                text: `${formatLimit(plan.maxDevices)} Device Registrations`
            });
        } else {
            features.push({
                icon: '📱',
                text: 'Unlimited Device Registrations'
            });
        }
        if (plan.maxApiTraces !== null && plan.maxApiTraces !== undefined) {
            features.push({
                icon: '⚡',
                text: `API Tracing - Monitor up to ${formatLimit(plan.maxApiTraces)} API requests/month`
            });
        } else {
            features.push({
                icon: '⚡',
                text: 'API Tracing - Unlimited API requests'
            });
        }
        if (plan.maxLogs !== null && plan.maxLogs !== undefined) {
            features.push({
                icon: '📝',
                text: `Remote Logging - Stream up to ${formatLimit(plan.maxLogs)} logs/month`
            });
        } else {
            features.push({
                icon: '📝',
                text: 'Remote Logging - Unlimited logs'
            });
        }
        if (plan.maxSessions !== null && plan.maxSessions !== undefined) {
            features.push({
                icon: '📊',
                text: `Session Timeline - Track up to ${formatLimit(plan.maxSessions)} sessions/month`
            });
        } else {
            features.push({
                icon: '📊',
                text: 'Session Timeline - Unlimited sessions'
            });
        }
        if (plan.maxCrashes !== null && plan.maxCrashes !== undefined) {
            features.push({
                icon: '💥',
                text: `Crash Reports - Track up to ${formatLimit(plan.maxCrashes)} crashes/month`
            });
        } else {
            features.push({
                icon: '💥',
                text: 'Crash Reports - Unlimited crashes'
            });
        }
        // Feature Flags - Only show if enabled
        if (plan.allowBusinessConfig) {
            features.push({
                icon: '⚙️',
                text: 'Business Configuration'
            });
        }
        if (plan.allowLocalization) {
            features.push({
                icon: '🌍',
                text: 'Localization & Translations'
            });
        }
        if (plan.allowApiTracking) {
            features.push({
                icon: '🎭',
                text: 'API Mocking'
            });
        }
        features.push({
            icon: '📦',
            text: 'Build Versioning'
        });
        features.push({
            icon: '🔍',
            text: 'Device Debug Mode'
        });
        return features;
    };
    const retentionDays = freePlan?.retentionDays || 30;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-950 flex",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-12 flex-col justify-center border-r border-gray-800",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-4xl font-bold text-white mb-3",
                                    children: "Start Free Forever"
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 166,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-lg text-gray-400",
                                    children: "Full access to all features. No credit card required. No expiration."
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 169,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                            lineNumber: 165,
                            columnNumber: 11
                        }, this),
                        planLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-400",
                                children: "Loading plan information..."
                            }, void 0, false, {
                                fileName: "[project]/dashboard/src/app/register/page.tsx",
                                lineNumber: 177,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                            lineNumber: 176,
                            columnNumber: 13
                        }, this) : freePlan ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider",
                                    children: "Included Features"
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 181,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 gap-2.5",
                                    children: generateFeatures(freePlan).slice(0, 6).map((feature, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FeatureItem, {
                                            text: feature.text
                                        }, index, false, {
                                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                                            lineNumber: 186,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 184,
                                    columnNumber: 15
                                }, this),
                                generateFeatures(freePlan).length > 6 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-500 mt-3",
                                    children: [
                                        "+ ",
                                        generateFeatures(freePlan).length - 6,
                                        " more features"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 190,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                            lineNumber: 180,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-yellow-400",
                                children: "Free plan information unavailable"
                            }, void 0, false, {
                                fileName: "[project]/dashboard/src/app/register/page.tsx",
                                lineNumber: 197,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                            lineNumber: 196,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3 mt-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InfoCard, {
                                    title: "Data Retention",
                                    description: `${retentionDays}-day retention per billing cycle. Data only deleted upon account deletion request.`
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 203,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InfoCard, {
                                    title: "Monthly Renewal",
                                    description: "Your free plan renews automatically every month. Usage meters reset, but all historical data is preserved."
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 207,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InfoCard, {
                                    title: "Free Forever",
                                    description: "No expiration date. Your free plan continues indefinitely. Upgrade anytime to unlock higher limits and premium features."
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 211,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                            lineNumber: 202,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                    lineNumber: 164,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/dashboard/src/app/register/page.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full lg:w-1/2 flex justify-center p-8 pt-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full max-w-md",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-bold text-white mb-2",
                                    children: "Create Your Account"
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 223,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-400",
                                    children: "Start free forever - no expiration"
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 224,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                            lineNumber: 222,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            className: "space-y-4",
                            children: [
                                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm",
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 229,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "name",
                                            className: "block text-sm font-medium text-gray-300 mb-1",
                                            children: "Name"
                                        }, void 0, false, {
                                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                                            lineNumber: 235,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "name",
                                            type: "text",
                                            value: name,
                                            onChange: (e)=>setName(e.target.value),
                                            className: "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                            placeholder: "John Doe"
                                        }, void 0, false, {
                                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                                            lineNumber: 238,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 234,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "email",
                                            className: "block text-sm font-medium text-gray-300 mb-1",
                                            children: "Email"
                                        }, void 0, false, {
                                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                                            lineNumber: 249,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "email",
                                            type: "email",
                                            value: email,
                                            onChange: (e)=>setEmail(e.target.value),
                                            className: "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                            placeholder: "you@example.com",
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                                            lineNumber: 252,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 248,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "password",
                                            className: "block text-sm font-medium text-gray-300 mb-1",
                                            children: "Password"
                                        }, void 0, false, {
                                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                                            lineNumber: 264,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "password",
                                            type: "password",
                                            value: password,
                                            onChange: (e)=>setPassword(e.target.value),
                                            className: "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                            placeholder: "••••••••",
                                            required: true,
                                            minLength: 6
                                        }, void 0, false, {
                                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                                            lineNumber: 267,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 text-xs text-gray-500",
                                            children: "Minimum 6 characters"
                                        }, void 0, false, {
                                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                                            lineNumber: 277,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 263,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: loading,
                                    className: "w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors",
                                    children: loading ? 'Creating account...' : 'Start Free Forever'
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 280,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                            lineNumber: 227,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-6 text-center text-gray-400 text-sm",
                            children: [
                                "Already have an account?",
                                ' ',
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/login",
                                    className: "text-blue-400 hover:text-blue-300 font-medium",
                                    children: "Sign in"
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 291,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                            lineNumber: 289,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-4 text-center text-xs text-gray-500",
                            children: [
                                "By creating an account, you agree to our",
                                ' ',
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "#",
                                    className: "text-blue-400 hover:text-blue-300",
                                    children: "Terms of Service"
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 298,
                                    columnNumber: 13
                                }, this),
                                ' ',
                                "and",
                                ' ',
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "#",
                                    className: "text-blue-400 hover:text-blue-300",
                                    children: "Privacy Policy"
                                }, void 0, false, {
                                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                                    lineNumber: 302,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/dashboard/src/app/register/page.tsx",
                            lineNumber: 296,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/dashboard/src/app/register/page.tsx",
                    lineNumber: 221,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/dashboard/src/app/register/page.tsx",
                lineNumber: 220,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/dashboard/src/app/register/page.tsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}
function FeatureItem({ text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center text-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckIcon, {
                className: "w-4 h-4 text-green-400 mr-3 flex-shrink-0"
            }, void 0, false, {
                fileName: "[project]/dashboard/src/app/register/page.tsx",
                lineNumber: 315,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-gray-400",
                children: text
            }, void 0, false, {
                fileName: "[project]/dashboard/src/app/register/page.tsx",
                lineNumber: 316,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/dashboard/src/app/register/page.tsx",
        lineNumber: 314,
        columnNumber: 5
    }, this);
}
function InfoCard({ title, description }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-sm font-semibold text-white mb-1",
                children: title
            }, void 0, false, {
                fileName: "[project]/dashboard/src/app/register/page.tsx",
                lineNumber: 324,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-gray-400 leading-relaxed",
                children: description
            }, void 0, false, {
                fileName: "[project]/dashboard/src/app/register/page.tsx",
                lineNumber: 325,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/dashboard/src/app/register/page.tsx",
        lineNumber: 323,
        columnNumber: 5
    }, this);
}
function CheckIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M5 13l4 4L19 7"
        }, void 0, false, {
            fileName: "[project]/dashboard/src/app/register/page.tsx",
            lineNumber: 333,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/dashboard/src/app/register/page.tsx",
        lineNumber: 332,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=dashboard_src_c715cc05._.js.map