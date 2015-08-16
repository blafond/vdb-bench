/**
 * Repository Selection Service
 *
 * Provides the collection of repositories {hostname, port} fetched
 * from local storage and the active (selected) repository.
 */
var vdbBench = (function(vdbBench) {

    var BASE_URL = '/api/v1';

    vdbBench._module.factory('RepoSelectionService',
             function($rootScope, StorageService) {

                var defaultRepository = {
                    hostname : 'localhost',
                    port : 3000,
                    baseUrl : BASE_URL
                };

                var repos;

                var selected;

                /*
                 * private function for initialising the repositories from local storage
                 */
                function initRepositories() {
                    var storageRepos = StorageService.getObject('repositories');
                    if (_.isEmpty(storageRepos)) {
                        storageRepos = [defaultRepository];
                        StorageService.setObject('repositories', storageRepos);
                    }

                    return storageRepos;
                }

                /*
                 * private function for accessing the repositories but first checking
                 * whether they have been initialised
                 */
                function repositories() {
                    if (_.isEmpty(repos))
                        repos = initRepositories();

                    return repos;
                }

                /*
                 * private function to initialise the selected repository name
                 * from local storage
                 */
                function initSelectedRepository() {
                    var selectedName = StorageService.get('selectedRepositoryName');

                    if (selectedName == null) {
                        selectedName = defaultRepository.hostname;
                        StorageService.set('selectedRepositoryName', selectedName);
                    }

                    var currRepos = repositories();
                    for (i = 0; i < currRepos.length; ++i) {
                        if (currRepos[i].hostname == selectedName)
                            return currRepos[i];
                    }

                    return null;
                }

                /*
                 * Service instance to be returned
                 */
                var service = {};

                /*
                 * Service : get selected repository
                 */
                service.getSelected = function() {
                    if (_.isEmpty(selected))
                        selected = initSelectedRepository();

                    return selected;
                };

                /*
                 * Service : set selected repository
                 */
                service.setSelected = function(selectedRepo) {
                    // Save the selected repository name
                    StorageService.set('selectedRepositoryName', selectedRepo.hostname);

                    // Set selected to the selected repository
                    selected = selectedRepo;

                    // Useful for broadcasting the selected repository has been
                    // updated
                    $rootScope.$broadcast("selectedRepoChanged");
                };

                /*
                 * Service : get repositories
                 */
                service.getRepositories = function() {
                    return repositories();
                };

                /*
                 * Service : is a repository selected
                 */
                service.isRepositorySelected = function() {
                    return ! _.isEmpty(selected);
                },

                /*
                 * Service : is the localhost repository selected
                 */
                service.isLocalhostSelected = function() {
                    if (_.isEmpty(selected))
                        return false;

                    return selected.hostname == "localhost";
                }

                /*
                 * Service : save the repositories to local storage
                 */
                service.saveRepositories = function() {
                    StorageService.setObject('repositories', repos);

                    //
                    // Need to save as well since the hostname of the selected repository
                    // may have been edited. Ensures that next time of loading the 'new'
                    // hostname is used to select the correct repository
                    //
                    var hostname = _.isEmpty(selected) ? '' : selected.hostname;
                    StorageService.set('selectedRepositoryName', hostname);
                };

                /*
                 * Service : add a new repository to the collection
                 */
                service.newRepository = function() {
                    var baseName = "newhost";
                    var currRepos = repositories();
                    var newRepo = null;
                    var index = 1;

                    while(newRepo == null) {
                        var testName = baseName + index;
                        var exists = false;

                        for (i = 0; i < currRepos.length; ++i) {
                            if (currRepos[i].hostname == testName) {
                                exists = true;
                                break;
                            }
                        }

                        if (! exists)
                            newRepo = {
                                hostname : testName,
                                port : 8080,
                                baseUrl : BASE_URL
                            };
                        else
                            index++;
                    }

                    // Add the new repository to the collection
                    repos.push(newRepo);

                    // Set the selected to the new repository
                    service.setSelected(newRepo);

                    // Save the new collection to local storage
                    service.saveRepositories();
                };

                /*
                 * Service : remove selected repository from the collection
                 */
                service.removeSelected = function() {
                    if (selected == null)
                        return;

                    if (service.isLocalhostSelected())
                        return;

                    repos.pop(selected);

                    // Set the selected to the first in the collection
                    service.setSelected(repos[0]);

                    // Save the new collection to local storage
                    service.saveRepositories();
                };

                /*
                 * Initialise the cached vars
                 */
                repos = initRepositories();
                selected = initSelectedRepository;

                return service;
            });

    return vdbBench;

})(vdbBench || {});