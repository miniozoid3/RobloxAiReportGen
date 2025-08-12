// ==UserScript==
// @name         Roblox AI Report Gen
// @author       Jimmy/miniozoid
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Userscript to quickly generate reports for TOS breaking Roblox users.
// @match        https://www.roblox.com/illegal-content-reporting*
// @match        https://www.roblox.com/users/*/profile*
// @icon         https://www.roblox.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect  *
// ==/UserScript==

(function() {
    'use strict';

    const url = window.location.href;
    const email = "YourEmailHere"

    if (url.startsWith('https://www.roblox.com/illegal-content-reporting')) {
        let reportReason = null;
        let userId = null;

        function wrapWithRelative(element) {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.style.width = element.offsetWidth + 'px';
            element.parentNode.insertBefore(wrapper, element);
            wrapper.appendChild(element);
            return wrapper;
        }

        function showLoadingOverlay(element) {
            const wrapper = wrapWithRelative(element);

            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = 'rgba(255, 255, 255, 0.8)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = '1000';
            overlay.style.borderRadius = getComputedStyle(element).borderRadius;

            const spinner = document.createElement('div');
            spinner.style.border = '4px solid #f3f3f3';
            spinner.style.borderTop = '4px solid #3498db';
            spinner.style.borderRadius = '50%';
            spinner.style.width = '24px';
            spinner.style.height = '24px';
            spinner.style.animation = 'spin 1s linear infinite';

            const style = document.createElement('style');
            style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
            document.head.appendChild(style);

            overlay.appendChild(spinner);
            wrapper.appendChild(overlay);

            return overlay;
        }

        function triggerEvents(element) {
            ['input', 'change'].forEach(eventType => {
                const event = new Event(eventType, {
                    bubbles: true
                });
                element.dispatchEvent(event);
            });
            if (element.type === 'checkbox') {
                const clickEvent = new MouseEvent('click', {
                    bubbles: true
                });
                element.dispatchEvent(clickEvent);
            }
        }

        function setNativeValue(element, value) {
            const valueSetter = Object.getOwnPropertyDescriptor(element.__proto__, 'value')?.set;
            const prototype = Object.getPrototypeOf(element);
            const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

            if (valueSetter && valueSetter !== prototypeValueSetter) {
                prototypeValueSetter.call(element, value);
            } else if (valueSetter) {
                valueSetter.call(element, value);
            } else {
                element.value = value;
            }

            triggerEvents(element);
        }

        function waitForElement(selector, maxWaitMs = 5000) {
            return new Promise((resolve) => {
                const startTime = Date.now();

                function check() {
                    const el = document.querySelector(selector);
                    if (el) {
                        resolve(el);
                    } else if (Date.now() - startTime < maxWaitMs) {
                        setTimeout(check, 100);
                    } else {
                        resolve(null);
                    }
                }
                check();
            });
        }

        async function fillForm() {
            const params = new URLSearchParams(window.location.search);
            userId = params.get('id');
            if (!userId) return;

            const textarea = document.querySelector('textarea.ticket-message.form-control.input-field.nonresizable');
            if (!textarea) return;

            const overlay = showLoadingOverlay(textarea);

            GM_xmlhttpRequest({
                method: 'GET',
                url: `http://localhost:8000/robloxreport/${userId}`,
                onload: async function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        reportReason = data.report || `No report reason found for user ${userId}.`;
                        setNativeValue(textarea, reportReason);
                    } catch (err) {
                        reportReason = `Error retrieving report reason for user ${userId}.`;
                        setNativeValue(textarea, reportReason);
                        console.error(err);
                    }
                    overlay.remove();

                    const urlInput = await waitForElement('input[data-testid="url-textbox"]');
                    if (urlInput) {
                        const profileUrl = `https://www.roblox.com/User.aspx?ID=${userId}`;
                        setNativeValue(urlInput, profileUrl);
                    }

                    const emailSelector = 'input.form-control.input-field[maxlength="320"]:not([data-testid])';
                    const emailInput = await waitForElement(emailSelector);
                    if (emailInput) {
                        setNativeValue(emailInput, email);
                    }

                    const checkbox = await waitForElement('#confirmCheckbox');
                    if (checkbox) {
                        checkbox.checked = true;
                        triggerEvents(checkbox);
                    }
                },
                onerror: async function() {
                    reportReason = `Failed to fetch report reason for user ${userId}.`;
                    setNativeValue(textarea, reportReason);
                    overlay.remove();

                    const urlInput = await waitForElement('input[data-testid="url-textbox"]');
                    if (urlInput) {
                        const profileUrl = `https://www.roblox.com/users/${userId}/profile`;
                        setNativeValue(urlInput, profileUrl);
                    }

                    const emailSelector = 'input.form-control.input-field[maxlength="320"]:not([data-testid])';
                    const emailInput = await waitForElement(emailSelector);
                    if (emailInput) {
                        setNativeValue(emailInput, email);
                    }

                    const checkbox = await waitForElement('#confirmCheckbox');
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                }
            });
        }

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            fillForm();
        } else {
            document.addEventListener('DOMContentLoaded', fillForm);
        }

    } else if (url.includes('/profile')) {
        function addReportButton() {
            const container = document.querySelector('.profile-header-buttons');
            if (!container) return;

            if (container.querySelector('.custom-report-btn')) return;

            const reportBtn = document.createElement('button');
            reportBtn.textContent = 'Report';
            reportBtn.className = 'btn-control-md btn-secondary custom-report-btn';
            reportBtn.style.marginLeft = '6px';

            const userIdMatch = window.location.pathname.match(/\/users\/(\d+)\//);
            if (userIdMatch) {
                const userId = userIdMatch[1];
                reportBtn.onclick = () => {
                    window.open(`https://www.roblox.com/illegal-content-reporting?id=${userId}`, '_blank');
                };
            }

            container.appendChild(reportBtn);
        }

        const observer = new MutationObserver(addReportButton);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        addReportButton();
    }
})();